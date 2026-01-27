import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

// Primary PDF parser using pdf-parse (more robust)
async function parsePDFWithPdfParse(buffer: Buffer): Promise<string> {
  try {
    console.log('[PDF Extract] Trying pdf-parse...');
    // Dynamic import to avoid build issues
    const { PDFParse } = await import('pdf-parse');
    // Convert Buffer to Uint8Array for pdf-parse v2
    const uint8Array = new Uint8Array(buffer);
    const pdfParser = new PDFParse({ data: uint8Array });
    // getText() returns TextResult with .text property containing all pages
    const textResult = await pdfParser.getText();
    const text = textResult?.text || "";
    console.log(`[PDF Extract] pdf-parse success: ${text.length} chars from ${textResult?.total || 0} pages`);
    return text;
  } catch (error) {
    console.error('[PDF Extract] pdf-parse failed:', error);
    throw error;
  }
}

// Fallback PDF parser using unpdf
async function parsePDFWithUnpdf(buffer: Buffer): Promise<string> {
  try {
    console.log('[PDF Extract] Trying unpdf as fallback...');
    const { extractText } = await import('unpdf');
    const uint8Array = new Uint8Array(buffer);
    const { text, totalPages } = await extractText(uint8Array, { mergePages: true });
    console.log(`[PDF Extract] unpdf success: ${text?.length || 0} chars from ${totalPages} pages`);
    return text || "";
  } catch (error) {
    console.error('[PDF Extract] unpdf failed:', error);
    throw error;
  }
}

// Main PDF extraction with fallback
async function parsePDF(buffer: Buffer): Promise<string> {
  console.log('[PDF Extract] Starting extraction, buffer size:', buffer.length, 'bytes');

  // Try pdf-parse first (more robust)
  try {
    const text = await parsePDFWithPdfParse(buffer);
    if (text && text.trim().length > 10) {
      return text;
    }
    console.log('[PDF Extract] pdf-parse returned empty, trying fallback...');
  } catch (e) {
    console.log('[PDF Extract] pdf-parse failed, trying fallback...');
  }

  // Fallback to unpdf
  try {
    const text = await parsePDFWithUnpdf(buffer);
    if (text && text.trim().length > 10) {
      return text;
    }
  } catch (e) {
    console.log('[PDF Extract] unpdf also failed');
  }

  throw new Error('All PDF extraction methods failed');
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
          extractedText = `[PDF: ${file.name}] - Extraction returned too little text. This PDF may be scanned. Please copy-paste the content manually.`;
        }
      } catch (pdfError) {
        const errorMessage = (pdfError as Error).message || 'Unknown error';
        console.error("[PDF Extract] Error:", errorMessage);
        extractedText = `[PDF: ${file.name}] - Extraction error: ${errorMessage}. Please copy-paste the content.`;
      }
    } else if (fileName.endsWith(".docx")) {
      try {
        const mammoth = await import("mammoth");
        const buffer = Buffer.from(arrayBuffer);
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value || "";
        extractedText = cleanExtractedText(extractedText);

        if (!extractedText || extractedText.length < 50) {
          extractedText = `[DOCX: ${file.name}] - Text could not be extracted.`;
        }
      } catch (docxError) {
        console.error("DOCX parse error:", docxError);
        extractedText = `[DOCX: ${file.name}] - Error during extraction.`;
      }
    } else if (fileName.endsWith(".doc")) {
      extractedText = `[DOC: ${file.name}] - Old format not supported. Please convert to .docx or copy-paste the content.`;
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
