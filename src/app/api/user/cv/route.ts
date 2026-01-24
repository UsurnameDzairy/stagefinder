import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile } from "fs/promises";
import { join } from "path";
import { parseCV } from "@/lib/cv-parser";
import { extractTextFromPdf } from "@/lib/pdf-parser";

/**
 * Nettoyer le texte extrait d'un PDF des métadonnées et données brutes
 */
function cleanPdfText(text: string): string {
  if (!text) return "";
  
  // Supprimer les métadonnées PDF courantes
  let cleaned = text
    // Supprimer les références xref et objets PDF
    .replace(/\d+\s+\d+\s+obj[\s\S]*?endobj/gi, '')
    .replace(/xref[\s\S]*?%%EOF/gi, '')
    .replace(/startxref[\s\S]*$/gi, '')
    .replace(/trailer[\s\S]*$/gi, '')
    .replace(/%%EOF/gi, '')
    // Supprimer les streams binaires
    .replace(/stream[\s\S]*?endstream/gi, '')
    // Supprimer les références d'objets
    .replace(/\d+\s+\d+\s+R/g, '')
    .replace(/\d+\s+\d+\s+n/g, '')
    .replace(/\d+\s+\d+\s+f/g, '')
    // Supprimer les métadonnées XMP
    .replace(/<\?xpacket[\s\S]*?\?>/gi, '')
    .replace(/xmp[:\w]+/gi, '')
    .replace(/pdf[:\w]+/gi, '')
    .replace(/dc[:\w]+/gi, '')
    // Supprimer les codes hexadécimaux
    .replace(/[A-F0-9]{4,}/gi, ' ')
    // Supprimer les lignes avec uniquement des chiffres
    .replace(/^\s*[\d\s]+\s*$/gm, '')
    // Supprimer les caractères de contrôle et binaires
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
    // Supprimer les lignes vides multiples
    .replace(/\n{3,}/g, '\n\n')
    // Supprimer les espaces multiples
    .replace(/[ \t]{2,}/g, ' ')
    // Nettoyer les lignes
    .split('\n')
    .map(line => line.trim())
    .filter(line => {
      // Garder seulement les lignes avec du contenu significatif
      if (line.length < 2) return false;
      // Ignorer les lignes qui ressemblent à des métadonnées PDF
      if (/^(obj|endobj|stream|endstream|xref|trailer|startxref)$/i.test(line)) return false;
      if (/^\d+\s+\d+\s+(obj|R|n|f)$/i.test(line)) return false;
      if (/^[<>\[\]{}\/]+$/.test(line)) return false;
      // Ignorer les lignes avec trop de caractères spéciaux
      const specialChars = (line.match(/[^a-zA-ZÀ-ÿ0-9\s.,;:!?@\-'()]/g) || []).length;
      if (specialChars > line.length * 0.5) return false;
      return true;
    })
    .join('\n');
  
  return cleaned.trim();
}

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
      }
    } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      try {
        // Pour DOCX, extraire le texte via décompression ZIP
        const AdmZip = require("adm-zip");
        const zip = new AdmZip(buffer);
        const documentXml = zip.readAsText("word/document.xml");
        
        // Extraire le texte des balises w:t
        const matches = documentXml.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
        if (matches) {
          extractedText = matches
            .map((m: string) => m.replace(/<[^>]+>/g, ""))
            .join(" ");
        }
        
        console.log("DOCX text extracted, length:", extractedText.length);
        
        if (extractedText) {
          parsedData = parseCV(extractedText);
          console.log("Parsed DOCX data:", JSON.stringify(parsedData, null, 2));
        }
      } catch (error) {
        console.error("DOCX parsing error:", error);
        // Fallback basique
        try {
          const text = buffer.toString("utf-8");
          const matches = text.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
          if (matches) {
            extractedText = matches.map((m) => m.replace(/<[^>]+>/g, "")).join(" ");
            parsedData = parseCV(extractedText);
          }
        } catch (fallbackError) {
          console.error("DOCX fallback error:", fallbackError);
        }
      }
    }

    // Créer un nom de fichier unique
    const timestamp = Date.now();
    const fileName = `cv-${session.id}-${timestamp}.${file.name.split(".").pop()}`;
    const uploadDir = join(process.cwd(), "public", "uploads", "cv");
    
    // Créer le dossier s'il n'existe pas
    const { mkdir } = await import("fs/promises");
    await mkdir(uploadDir, { recursive: true });

    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Sauvegarder dans la base de données
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
        console.log("Nom complet:", parsedData.fullName);
        console.log("Prénom:", parsedData.firstName);
        console.log("Nom:", parsedData.lastName);
        console.log("Email:", parsedData.email);
        console.log("Téléphone:", parsedData.phone);
        console.log("Compétences:", parsedData.skills.length, "trouvées");
        console.log("Compétences par catégorie:", JSON.stringify(parsedData.skillsByCategory, null, 2));
        console.log("Villes:", parsedData.cities);
        console.log("Niveau d'études:", parsedData.educationLevel);
        console.log("École:", parsedData.schoolName);
        console.log("Expériences:", parsedData.experiences.length, "trouvées");
        console.log("Langues:", parsedData.languages);
        console.log("Domaines:", parsedData.domains);
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
          
          console.log("Compétences à sauvegarder:", skillsWithCategory.map(s => s.name));

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
      filePath: `/uploads/cv/${fileName}`,
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
