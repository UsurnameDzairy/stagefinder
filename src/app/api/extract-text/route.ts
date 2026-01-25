import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import mammoth from "mammoth";

// Dynamic import for pdf-parse to avoid ESM issues
async function parsePDF(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse");
  const data = await pdfParse(buffer);
  return data.text || "";
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();
    let extractedText = "";

    if (fileName.endsWith(".pdf")) {
      // Extraction PDF avec pdf-parse
      try {
        const buffer = Buffer.from(arrayBuffer);
        extractedText = await parsePDF(buffer);
        extractedText = cleanExtractedText(extractedText);
        
        console.log(`[PDF Extract] ${file.name}: ${extractedText.length} caractères extraits`);
        
        if (!extractedText || extractedText.length < 50) {
          extractedText = `[PDF: ${file.name}] - Le texte n'a pas pu être extrait. Ce PDF peut contenir uniquement des images.`;
        }
      } catch (pdfError) {
        console.error("PDF parse error:", pdfError);
        extractedText = `[PDF: ${file.name}] - Erreur lors de l'extraction. Veuillez copier-coller le contenu.`;
      }
    } else if (fileName.endsWith(".docx")) {
      // Extraction Word DOCX avec mammoth
      try {
        const buffer = Buffer.from(arrayBuffer);
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value || "";
        extractedText = cleanExtractedText(extractedText);
        
        if (!extractedText || extractedText.length < 50) {
          extractedText = `[DOCX: ${file.name}] - Le texte n'a pas pu être extrait.`;
        }
      } catch (docxError) {
        console.error("DOCX parse error:", docxError);
        extractedText = `[DOCX: ${file.name}] - Erreur lors de l'extraction.`;
      }
    } else if (fileName.endsWith(".doc")) {
      extractedText = `[DOC: ${file.name}] - Format ancien non supporté. Veuillez convertir en .docx ou copier-coller le contenu.`;
    } else if (fileName.endsWith(".txt") || fileName.endsWith(".md")) {
      extractedText = await file.text();
    } else {
      extractedText = await file.text();
    }

    return NextResponse.json({ 
      text: extractedText,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      success: extractedText.length > 50,
    });
  } catch (error) {
    console.error("Text extraction error:", error);
    return NextResponse.json({ error: "Failed to extract text" }, { status: 500 });
  }
}

// Nettoyer le texte extrait
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
    .map(line => line.trim())
    .join("\n")
    // Supprimer les lignes vides au début et à la fin
    .trim();
}
