import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { jsPDF } from "jspdf";

/**
 * Generate a professional PDF from improved CV text
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { cvText, userName } = body;

    if (!cvText) {
      return NextResponse.json({ error: "CV text required" }, { status: 400 });
    }

    // Create PDF
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Page dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Set default font
    doc.setFont("helvetica");

    // Split CV text into lines and process
    const lines = cvText.split("\n");

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Check if we need a new page
      if (yPosition > pageHeight - margin - 10) {
        doc.addPage();
        yPosition = margin;
      }

      // Detect headers (lines with === or ---)
      if (trimmedLine.includes("═══") || trimmedLine.includes("───")) {
        // Draw a line
        doc.setDrawColor(100, 100, 100);
        doc.setLineWidth(0.3);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;
        continue;
      }

      // Detect section headers (all caps, short lines)
      if (
        trimmedLine.length > 0 &&
        trimmedLine.length < 50 &&
        trimmedLine === trimmedLine.toUpperCase() &&
        !trimmedLine.startsWith("•") &&
        !trimmedLine.includes("@") &&
        !trimmedLine.includes("|")
      ) {
        // Section header
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(40, 40, 40);
        doc.text(trimmedLine, pageWidth / 2, yPosition, { align: "center" });
        yPosition += 8;
        continue;
      }

      // Contact line (contains @ or |)
      if (trimmedLine.includes("@") || (trimmedLine.includes("|") && trimmedLine.length < 100)) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);
        doc.text(trimmedLine, pageWidth / 2, yPosition, { align: "center" });
        yPosition += 5;
        continue;
      }

      // Bullet points
      if (trimmedLine.startsWith("•") || trimmedLine.startsWith("-")) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(50, 50, 50);

        // Wrap text if too long
        const bulletText = trimmedLine.substring(1).trim();
        const wrappedLines = doc.splitTextToSize(bulletText, contentWidth - 10);

        // Draw bullet
        doc.text("•", margin, yPosition);

        // Draw wrapped text
        wrappedLines.forEach((wrappedLine: string, index: number) => {
          doc.text(wrappedLine, margin + 5, yPosition + (index * 5));
        });

        yPosition += wrappedLines.length * 5 + 2;
        continue;
      }

      // Regular text
      if (trimmedLine.length > 0) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(50, 50, 50);

        const wrappedLines = doc.splitTextToSize(trimmedLine, contentWidth);
        wrappedLines.forEach((wrappedLine: string, index: number) => {
          doc.text(wrappedLine, margin, yPosition + (index * 5));
        });

        yPosition += wrappedLines.length * 5 + 2;
      } else {
        // Empty line
        yPosition += 3;
      }
    }

    // Add footer
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text("Generated with KamForJob - Harvard-style CV Improver", pageWidth / 2, pageHeight - 10, { align: "center" });

    // Generate PDF as base64
    const pdfBase64 = doc.output("datauristring");

    return NextResponse.json({
      success: true,
      pdf: pdfBase64,
      filename: `CV_${userName || "Improved"}_${new Date().toISOString().split("T")[0]}.pdf`,
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
