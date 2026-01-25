import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();
    let text = "";

    // Lire le contenu du fichier
    const buffer = Buffer.from(await file.arrayBuffer());

    if (fileName.endsWith(".pdf")) {
      // Parser le PDF with require to avoid ESM issues
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require("pdf-parse");
        const pdfData = await pdfParse(buffer);
        text = pdfData.text;

        // Nettoyer le texte extrait
        text = cleanExtractedText(text);
      } catch (pdfError) {
        console.error("PDF parsing error:", pdfError);
        return NextResponse.json(
          { success: false, error: "Erreur lors de la lecture du PDF. Essayez de copier-coller le texte." },
          { status: 400 }
        );
      }
    } else if (fileName.endsWith(".txt")) {
      // Fichier texte simple
      text = buffer.toString("utf-8");
    } else if (fileName.endsWith(".docx")) {
      // Pour DOCX, on extrait le texte basique
      try {
        // DOCX est un ZIP contenant du XML
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
      } catch (docxError) {
        console.error("DOCX parsing error:", docxError);
        // Fallback: essayer de lire comme texte
        text = buffer.toString("utf-8").replace(/<[^>]*>/g, " ");
      }
    } else {
      return NextResponse.json(
        { success: false, error: "Format de fichier non supporté" },
        { status: 400 }
      );
    }

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { success: false, error: "Le fichier semble vide ou illisible. Essayez de copier-coller le texte." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      text: text.trim(),
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error) {
    console.error("CV parse error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors du traitement du fichier" },
      { status: 500 }
    );
  }
}

/**
 * Nettoie le texte extrait d'un PDF pour une meilleure lisibilité
 */
function cleanExtractedText(text: string): string {
  return text
    // Supprimer les caractères de contrôle
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    // Normaliser les espaces multiples
    .replace(/[ \t]+/g, " ")
    // Normaliser les sauts de ligne multiples
    .replace(/\n{3,}/g, "\n\n")
    // Supprimer les espaces en début/fin de ligne
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    // Supprimer les lignes vides consécutives
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
