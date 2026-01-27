import { NextRequest, NextResponse } from "next/server";

// Primary PDF parser using pdf-parse (more robust)
async function parsePDFWithPdfParse(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import('pdf-parse');
  // Convert Buffer to Uint8Array for pdf-parse v2
  const uint8Array = new Uint8Array(buffer);
  const pdfParser = new PDFParse({ data: uint8Array });
  // getText() returns TextResult with .text property containing all pages
  const textResult = await pdfParser.getText();
  const text = textResult?.text || "";
  console.log(`[CV Parse] pdf-parse: ${text.length} chars from ${textResult?.total || 0} pages`);
  return text;
}

// Fallback PDF parser using unpdf
async function parsePDFWithUnpdf(buffer: Buffer): Promise<string> {
  const { extractText } = await import('unpdf');
  const uint8Array = new Uint8Array(buffer);
  const { text, totalPages } = await extractText(uint8Array, { mergePages: true });
  console.log(`[CV Parse] unpdf: ${text?.length || 0} chars from ${totalPages} pages`);
  return text || "";
}

// Main PDF extraction with fallback
async function parsePDF(buffer: Buffer): Promise<string> {
  // Try pdf-parse first
  try {
    const text = await parsePDFWithPdfParse(buffer);
    if (text && text.trim().length > 10) return text;
  } catch (e) {
    console.log('[CV Parse] pdf-parse failed, trying unpdf...');
  }

  // Fallback to unpdf
  try {
    const text = await parsePDFWithUnpdf(buffer);
    if (text && text.trim().length > 10) return text;
  } catch (e) {
    console.log('[CV Parse] unpdf also failed');
  }

  throw new Error('PDF extraction failed');
}

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

    // Read file content
    const buffer = Buffer.from(await file.arrayBuffer());

    if (fileName.endsWith(".pdf")) {
      // Parse PDF with fallback
      try {
        text = await parsePDF(buffer);
        text = cleanExtractedText(text);
      } catch (pdfError) {
        console.error("PDF parsing error:", pdfError);
        return NextResponse.json(
          { success: false, error: "Error reading PDF. Try copy-pasting the text instead." },
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
        { success: false, error: "Unsupported file format" },
        { status: 400 }
      );
    }

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { success: false, error: "The file appears to be empty or unreadable. Try copy-pasting the text instead." },
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
      { success: false, error: "Error processing file" },
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
