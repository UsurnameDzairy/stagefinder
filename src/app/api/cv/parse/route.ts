import { NextRequest, NextResponse } from "next/server";
import { extractText } from "unpdf";

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
      // Parse PDF using unpdf
      try {
        console.log("[PDF Parse] Extracting text from:", file.name);
        const uint8Array = new Uint8Array(buffer);
        const result = await extractText(uint8Array, { mergePages: true });
        text = Array.isArray(result.text) ? result.text.join("\n") : result.text;
        console.log("[PDF Parse] Extracted", text.length, "characters from", result.totalPages, "pages");

        // Clean extracted text
        text = cleanExtractedText(text);
      } catch (pdfError) {
        console.error("[PDF Parse] Error:", pdfError);
        return NextResponse.json(
          { success: false, error: "Error reading PDF. Try copying and pasting the text instead." },
          { status: 400 }
        );
      }
    } else if (fileName.endsWith(".txt")) {
      // Simple text file
      text = buffer.toString("utf-8");
    } else if (fileName.endsWith(".docx")) {
      // For DOCX, extract basic text
      try {
        // DOCX is a ZIP containing XML
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
      } catch (docxError) {
        console.error("[DOCX Parse] Error:", docxError);
        // Fallback: try reading as text
        text = buffer.toString("utf-8").replace(/<[^>]*>/g, " ");
      }
    } else {
      return NextResponse.json(
        { success: false, error: "Unsupported file format. Use PDF, TXT, or DOCX." },
        { status: 400 }
      );
    }

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { success: false, error: "The file appears to be empty or unreadable. Try copying and pasting the text." },
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
    console.error("[CV Parse] Error:", error);
    return NextResponse.json(
      { success: false, error: "Error processing file" },
      { status: 500 }
    );
  }
}

/**
 * Clean extracted text from PDF for better readability
 */
function cleanExtractedText(text: string): string {
  return text
    // Remove control characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    // Normalize multiple spaces
    .replace(/[ \t]+/g, " ")
    // Normalize multiple newlines
    .replace(/\n{3,}/g, "\n\n")
    // Remove leading/trailing spaces per line
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    // Remove consecutive empty lines
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
