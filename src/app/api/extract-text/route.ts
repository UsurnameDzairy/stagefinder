import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

// Use pdf-parse which bundles its own compatible pdfjs version
async function parsePDF(buffer: Buffer): Promise<string> {
  try {
    console.log('[PDF Extract] Starting extraction with pdf-parse...');

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse");

    const data = await pdfParse(buffer, {
      // Custom render to get better text extraction
      pagerender: function (pageData: any) {
        return pageData.getTextContent().then(function (textContent: any) {
          let text = '';
          for (const item of textContent.items) {
            text += item.str + ' ';
          }
          return text;
        });
      }
    });

    console.log(`[PDF Extract] Success! Extracted ${data.text?.length || 0} characters`);
    return data.text || "";

  } catch (error) {
    console.error('[PDF Extract] pdf-parse failed:', error);
    throw new Error(`PDF extraction failed: ${(error as Error).message}`);
  }
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
      try {
        const buffer = Buffer.from(arrayBuffer);
        console.log(`[PDF Extract] Processing ${file.name}, size: ${buffer.length} bytes`);

        extractedText = await parsePDF(buffer);

        if (!extractedText || !extractedText.trim()) {
          console.warn(`[PDF Extract] Warning: extraction returned empty text for ${file.name}`);
          extractedText = "";
        } else {
          extractedText = cleanExtractedText(extractedText);
          console.log(`[PDF Extract] Success: ${extractedText.length} chars extracted`);
        }

        if (!extractedText || extractedText.length < 50) {
          extractedText = `[PDF: ${file.name}] - L'extraction a retourné trop peu de texte. Ce PDF est peut-être scanné. Veuillez copier-coller le contenu manuellement.`;
        }
      } catch (pdfError) {
        const errorMessage = (pdfError as Error).message || 'Unknown error';
        console.error("[PDF Extract] Error:", errorMessage);
        extractedText = `[PDF: ${file.name}] - Erreur d'extraction: ${errorMessage}. Veuillez copier-coller le contenu.`;
      }
    } else if (fileName.endsWith(".docx")) {
      try {
        const mammoth = await import("mammoth");
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

function cleanExtractedText(text: string): string {
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map(line => line.trim())
    .join("\n")
    .trim();
}
