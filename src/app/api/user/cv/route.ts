import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseCV } from "@/lib/cv-parser";
import { extractTextFromPdf } from "@/lib/pdf-parser";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Vérifier le type de fichier
    const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF and DOCX are allowed" },
        { status: 400 }
      );
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extraire le texte du CV
    let extractedText = "";
    let parsedData = null;

    if (file.type === "application/pdf") {
      try {
        // Utiliser unpdf pour extraire le texte du PDF
        console.log("🔍 Extracting text from PDF using unpdf...");
        extractedText = await extractTextFromPdf(buffer);

        console.log("PDF text extracted, length:", extractedText.length);
        console.log("PDF text preview:", extractedText.substring(0, 500));

        // Parser le CV pour extraire les informations
        if (extractedText && extractedText.length > 50) {
          parsedData = parseCV(extractedText);
          console.log("Parsed CV data:", JSON.stringify(parsedData, null, 2));
        }
      } catch (error) {
        console.error("PDF parsing error:", error);
        return NextResponse.json(
          { error: "Error reading PDF. Try a different file or copy/paste the text." },
          { status: 400 }
        );
      }
    } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      try {
        // Pour DOCX, utiliser mammoth
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;

        console.log("DOCX text extracted, length:", extractedText.length);

        if (extractedText && extractedText.length > 50) {
          parsedData = parseCV(extractedText);
          console.log("Parsed DOCX data:", JSON.stringify(parsedData, null, 2));
        }
      } catch (error) {
        console.error("DOCX parsing error:", error);
        return NextResponse.json(
          { error: "Error reading DOCX. Try a different file or copy/paste the text." },
          { status: 400 }
        );
      }
    }

    if (!extractedText || extractedText.length < 50) {
      return NextResponse.json(
        { error: "Could not extract text from file. The file may be empty or image-based." },
        { status: 400 }
      );
    }

    // Sauvegarder dans la base de données (sans le fichier physique)
    const resume = await prisma.resume.create({
      data: {
        userId: session.id,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        extractedText: extractedText || null,
        parsedData: parsedData ? JSON.stringify(parsedData) : null,
        skills: parsedData?.skills.join(", ") || null,
        isActive: true,
      },
    });

    // Désactiver les anciens CV
    await prisma.resume.updateMany({
      where: {
        userId: session.id,
        id: { not: resume.id },
      },
      data: {
        isActive: false,
      },
    });

    // Si on a des données parsées, mettre à jour automatiquement le profil
    if (parsedData) {
      try {
        console.log("=== CV PARSING RESULTS ===");
        console.log("Full name:", parsedData.fullName);
        console.log("First name:", parsedData.firstName);
        console.log("Last name:", parsedData.lastName);
        console.log("Email:", parsedData.email);
        console.log("Phone:", parsedData.phone);
        console.log("Skills:", parsedData.skills.length, "found");
        console.log("Skills by category:", JSON.stringify(parsedData.skillsByCategory, null, 2));
        console.log("Cities:", parsedData.cities);
        console.log("Education level:", parsedData.educationLevel);
        console.log("School:", parsedData.schoolName);
        console.log("Experiences:", parsedData.experiences.length, "found");
        console.log("Languages:", parsedData.languages);
        console.log("Domains:", parsedData.domains);
        console.log("=========================");

        // Mettre à jour le nom/prénom de l'utilisateur si trouvés
        if (parsedData.firstName || parsedData.lastName) {
          await prisma.user.update({
            where: { id: session.id },
            data: {
              firstName: parsedData.firstName || undefined,
              lastName: parsedData.lastName || undefined,
              name: parsedData.fullName || undefined,
            },
          });
        }

        // Créer ou mettre à jour le profil avec les données extraites
        await prisma.profile.upsert({
          where: { userId: session.id },
          create: {
            userId: session.id,
            preferredCities: parsedData.cities.join(", "),
            domains: parsedData.domains.join(", "),
            educationLevel: parsedData.educationLevel,
            schoolName: parsedData.schoolName,
            phone: parsedData.phone,
            languages: parsedData.languages.map(l => `${l.language}${l.level ? ` (${l.level})` : ''}`).join(", "),
          },
          update: {
            preferredCities: parsedData.cities.length > 0 ? parsedData.cities.join(", ") : undefined,
            domains: parsedData.domains.length > 0 ? parsedData.domains.join(", ") : undefined,
            educationLevel: parsedData.educationLevel || undefined,
            schoolName: parsedData.schoolName || undefined,
            phone: parsedData.phone || undefined,
            languages: parsedData.languages.length > 0 ? parsedData.languages.map(l => `${l.language}${l.level ? ` (${l.level})` : ''}`).join(", ") : undefined,
          },
        });

        // Ajouter les compétences extraites
        if (parsedData.skills.length > 0) {
          // Supprimer les anciennes compétences auto-extraites
          await prisma.userSkill.deleteMany({
            where: {
              userId: session.id,
              source: "cv",
            },
          });

          // Collecter toutes les compétences uniques
          const allSkillsSet = new Set<string>();
          const skillsWithCategory: { name: string; category: string }[] = [];

          // 1. Ajouter les compétences par catégorie (de la base de données)
          for (const [category, skills] of Object.entries(parsedData.skillsByCategory)) {
            for (const skill of skills) {
              if (!allSkillsSet.has(skill.toLowerCase())) {
                allSkillsSet.add(skill.toLowerCase());
                skillsWithCategory.push({ name: skill, category });
              }
            }
          }

          // 2. Ajouter les compétences extraites directement du CV (texte exact)
          for (const skill of parsedData.skills) {
            if (!allSkillsSet.has(skill.toLowerCase()) && skill.length >= 2) {
              allSkillsSet.add(skill.toLowerCase());
              skillsWithCategory.push({ name: skill, category: "extracted" });
            }
          }

          console.log("Skills to save:", skillsWithCategory.map(s => s.name));

          await prisma.userSkill.createMany({
            data: skillsWithCategory.map((skill) => ({
              userId: session.id,
              name: skill.name,
              category: skill.category,
              source: "cv",
            })),
            skipDuplicates: true,
          });
        }
      } catch (error) {
        console.error("Profile auto-update error:", error);
      }
    }

    return NextResponse.json({
      success: true,
      resume,
      parsedData,
    });
  } catch (error) {
    console.error("CV upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload CV" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resumes = await prisma.resume.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      resumes,
    });
  } catch (error) {
    console.error("CV fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch CVs" },
      { status: 500 }
    );
  }
}
