import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile } from "fs/promises";
import { join } from "path";
import { parseCV } from "@/lib/cv-parser";

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
        // Utiliser pdf-parse pour extraire le texte du PDF
        const pdf = require("pdf-parse/lib/pdf-parse.js");
        const pdfData = await pdf(buffer);
        extractedText = pdfData.text || "";
        console.log("PDF text extracted, length:", extractedText.length);
        
        // Parser le CV pour extraire les informations
        if (extractedText) {
          parsedData = parseCV(extractedText);
          console.log("Parsed CV data:", JSON.stringify(parsedData, null, 2));
        }
      } catch (error) {
        console.error("PDF parsing error:", error);
        // Fallback: essayer d'extraire du texte brut
        try {
          const textContent = buffer.toString("utf-8");
          // Chercher du texte lisible dans le PDF
          const textMatches = textContent.match(/[\w\s@.,-]+/g);
          if (textMatches) {
            extractedText = textMatches.filter(m => m.trim().length > 2).join(" ");
            if (extractedText.length > 50) {
              parsedData = parseCV(extractedText);
              console.log("Fallback parsed data:", JSON.stringify(parsedData, null, 2));
            }
          }
        } catch (fallbackError) {
          console.error("Fallback parsing error:", fallbackError);
        }
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
        // Créer ou mettre à jour le profil avec les données extraites
        await prisma.profile.upsert({
          where: { userId: session.id },
          create: {
            userId: session.id,
            preferredCities: parsedData.cities.join(", "),
            domains: parsedData.domains.join(", "),
            educationLevel: parsedData.educationLevel,
            schoolName: parsedData.schoolName,
          },
          update: {
            preferredCities: parsedData.cities.length > 0 ? parsedData.cities.join(", ") : undefined,
            domains: parsedData.domains.length > 0 ? parsedData.domains.join(", ") : undefined,
            educationLevel: parsedData.educationLevel || undefined,
            schoolName: parsedData.schoolName || undefined,
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

          // Ajouter les nouvelles compétences
          await prisma.userSkill.createMany({
            data: parsedData.skills.map((skill) => ({
              userId: session.id,
              name: skill,
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
