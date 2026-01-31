import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { extractText } from "unpdf";
import { callOpenRouter } from "@/lib/openrouter";

/**
 * Improve CV text using AI while keeping the same structure
 */
async function improveTextWithAI(cvText: string, language: "fr" | "en"): Promise<string> {
  const systemPrompt = language === "fr"
    ? `Tu es un expert en rédaction de CV de la Harvard Business School. Tu DOIS transformer chaque phrase du CV pour la rendre plus percutante. Le CV doit rester EN FRANÇAIS.

RÈGLES OBLIGATOIRES:
1. REMPLACE SYSTÉMATIQUEMENT ces termes faibles:
   - "je recherche" → "Aspirant à intégrer" ou "Déterminé à rejoindre"
   - "Étudiant en" → "Candidat spécialisé en" ou "Expert en formation en"
   - "Principaux cours" → "Expertise développée en" ou "Compétences acquises en"
   - "Spécialités" → "Domaines d'excellence"
   - "Stage" → "Mission stratégique" ou "Expérience professionnelle"
   - "j'ai fait" → "Piloté" / "Orchestré" / "Réalisé"
   - "travaillé sur" → "Contribué activement à" / "Mené"
   - "responsable de" → "Dirigé" / "Supervisé"

2. AJOUTE des verbes d'action Harvard au début de chaque bullet point:
   Piloté, Orchestré, Optimisé, Développé, Conçu, Analysé, Structuré, Négocié, Coordonné, Implémenté

3. TRANSFORME le profil/objectif en accroche percutante orientée résultats

4. GARDE la même structure et les mêmes informations factuelles (dates, entreprises, chiffres)

5. NE PAS inventer de nouvelles expériences

Réponds UNIQUEMENT avec le CV amélioré EN FRANÇAIS, sans commentaires.`
    : `You are a Harvard Business School CV writing expert. You MUST:
1. TRANSLATE the entire CV to ENGLISH
2. IMPROVE each sentence to make it more impactful

MANDATORY RULES:
1. TRANSLATE ALL CONTENT TO ENGLISH - every single word must be in English
2. SYSTEMATICALLY REPLACE weak terms:
   - "looking for" / "je recherche" → "Aspiring to join" or "Determined to integrate"
   - "Student in" / "Étudiant en" → "Specialized candidate in" or "Expert in training"
   - "Main courses" / "Principaux cours" → "Expertise developed in" or "Skills acquired in"
   - "Specialties" / "Spécialités" → "Areas of excellence"
   - "Internship" / "Stage" → "Strategic mission" or "Professional experience"
   - "responsible for" → "Directed" / "Supervised" / "Spearheaded"

3. ADD Harvard action verbs at the beginning of each bullet point:
   Spearheaded, Orchestrated, Optimized, Developed, Designed, Analyzed, Structured, Negotiated, Coordinated, Implemented

4. TRANSFORM the profile/objective into a results-oriented impactful hook

5. KEEP the same structure and factual information (dates, companies, numbers)

6. DO NOT invent new experiences

CRITICAL: The output must be 100% in ENGLISH. Respond ONLY with the improved CV in English, no comments.`;

  const userPrompt = language === "fr"
    ? `Transforme ce CV en version Harvard percutante EN FRANÇAIS. Chaque phrase doit être améliorée:\n\n${cvText}`
    : `TRANSLATE this CV to ENGLISH and transform it into an impactful Harvard version. The output MUST be entirely in English:\n\n${cvText}`;

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    { role: 'user' as const, content: userPrompt },
  ];

  const response = await callOpenRouter(messages, 'llama-3.3-70b-versatile', {
    temperature: 0.7,
    max_tokens: 4000,
  });

  return response;
}

/**
 * Create a new PDF with the improved text, preserving original structure
 */
async function createImprovedPDF(improvedText: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595.28; // A4 width in points
  const pageHeight = 841.89; // A4 height in points
  const margin = 50;
  const lineHeight = 14;
  const maxWidth = pageWidth - 2 * margin;

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let yPosition = pageHeight - margin;

  const lines = improvedText.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Check if we need a new page
    if (yPosition < margin + lineHeight) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      yPosition = pageHeight - margin;
    }

    // Detect headers (all caps, centered)
    const isHeader = trimmedLine.length > 0 &&
      trimmedLine.length < 50 &&
      trimmedLine === trimmedLine.toUpperCase() &&
      !trimmedLine.startsWith('•') &&
      !trimmedLine.includes('@') &&
      !trimmedLine.includes('|') &&
      !trimmedLine.match(/^\d/);

    // Detect name (first non-empty line, typically)
    const isName = lines.indexOf(line) < 3 &&
      trimmedLine.length > 0 &&
      trimmedLine.length < 50 &&
      !trimmedLine.includes('@') &&
      !trimmedLine.includes('|') &&
      !trimmedLine.startsWith('•');

    // Contact info line
    const isContact = trimmedLine.includes('@') ||
      (trimmedLine.includes('|') && trimmedLine.length < 150) ||
      trimmedLine.match(/^\+?\d[\d\s\-]+$/);

    // Section separator
    const isSeparator = trimmedLine.includes('═') || trimmedLine.includes('─') || trimmedLine.includes('---');

    if (isSeparator) {
      // Draw a line
      page.drawLine({
        start: { x: margin, y: yPosition },
        end: { x: pageWidth - margin, y: yPosition },
        thickness: 0.5,
        color: rgb(0.5, 0.5, 0.5),
      });
      yPosition -= lineHeight;
      continue;
    }

    if (trimmedLine.length === 0) {
      yPosition -= lineHeight * 0.5;
      continue;
    }

    let fontSize = 10;
    let currentFont = font;
    let textColor = rgb(0.2, 0.2, 0.2);
    let xPosition = margin;

    if (isName && lines.indexOf(line) === 0) {
      fontSize = 18;
      currentFont = boldFont;
      textColor = rgb(0, 0, 0);
      // Center the name
      const textWidth = currentFont.widthOfTextAtSize(trimmedLine, fontSize);
      xPosition = (pageWidth - textWidth) / 2;
    } else if (isHeader) {
      fontSize = 11;
      currentFont = boldFont;
      textColor = rgb(0.1, 0.1, 0.1);
      // Center headers
      const textWidth = currentFont.widthOfTextAtSize(trimmedLine, fontSize);
      xPosition = (pageWidth - textWidth) / 2;
      yPosition -= 5; // Extra space before headers
    } else if (isContact) {
      fontSize = 9;
      textColor = rgb(0.4, 0.4, 0.4);
      // Center contact info
      const textWidth = currentFont.widthOfTextAtSize(trimmedLine, fontSize);
      xPosition = (pageWidth - textWidth) / 2;
    }

    // Handle bullet points
    if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
      const bulletText = trimmedLine.substring(1).trim();

      // Draw bullet
      page.drawText('•', {
        x: margin,
        y: yPosition,
        size: fontSize,
        font: currentFont,
        color: textColor,
      });

      // Word wrap for long bullet points
      const words = bulletText.split(' ');
      let currentLine = '';
      let lineCount = 0;

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const textWidth = currentFont.widthOfTextAtSize(testLine, fontSize);

        if (textWidth > maxWidth - 15) {
          // Draw current line
          page.drawText(currentLine, {
            x: margin + 10,
            y: yPosition - (lineCount * lineHeight),
            size: fontSize,
            font: currentFont,
            color: textColor,
          });
          currentLine = word;
          lineCount++;

          // Check for new page
          if (yPosition - ((lineCount + 1) * lineHeight) < margin) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            yPosition = pageHeight - margin;
            lineCount = 0;
          }
        } else {
          currentLine = testLine;
        }
      }

      // Draw remaining text
      if (currentLine) {
        page.drawText(currentLine, {
          x: margin + 10,
          y: yPosition - (lineCount * lineHeight),
          size: fontSize,
          font: currentFont,
          color: textColor,
        });
      }

      yPosition -= (lineCount + 1) * lineHeight + 2;
    } else {
      // Regular text with word wrap
      const words = trimmedLine.split(' ');
      let currentLine = '';
      let lineCount = 0;

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const textWidth = currentFont.widthOfTextAtSize(testLine, fontSize);

        if (textWidth > maxWidth && currentLine) {
          page.drawText(currentLine, {
            x: xPosition,
            y: yPosition - (lineCount * lineHeight),
            size: fontSize,
            font: currentFont,
            color: textColor,
          });
          currentLine = word;
          lineCount++;

          if (yPosition - ((lineCount + 1) * lineHeight) < margin) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            yPosition = pageHeight - margin;
            lineCount = 0;
          }
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine) {
        // Recalculate xPosition for centered items
        if (isName || isHeader || isContact) {
          const textWidth = currentFont.widthOfTextAtSize(currentLine, fontSize);
          xPosition = (pageWidth - textWidth) / 2;
        }

        page.drawText(currentLine, {
          x: xPosition,
          y: yPosition - (lineCount * lineHeight),
          size: fontSize,
          font: currentFont,
          color: textColor,
        });
      }

      yPosition -= (lineCount + 1) * lineHeight;
      if (isHeader) yPosition -= 3;
    }
  }

  // Add footer
  const footerText = "Generated with KamForJob - Harvard-style CV Improver";
  const footerWidth = font.widthOfTextAtSize(footerText, 7);
  page.drawText(footerText, {
    x: (pageWidth - footerWidth) / 2,
    y: 25,
    size: 7,
    font: font,
    color: rgb(0.6, 0.6, 0.6),
  });

  return await pdfDoc.save();
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const language = (formData.get('language') as string) || 'fr';

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Read the PDF file
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    // Extract text from PDF
    console.log('📄 Extracting text from PDF...');
    const result = await extractText(uint8Array, { mergePages: true });
    const originalText = Array.isArray(result.text) ? result.text.join('\n') : result.text;
    console.log('📝 Extracted text length:', originalText.length);

    // Improve text with AI
    console.log('🤖 Improving text with AI...');
    const improvedText = await improveTextWithAI(originalText, language as "fr" | "en");
    console.log('✨ Improved text length:', improvedText.length);

    // Create new PDF with improved text
    console.log('📄 Creating improved PDF...');
    const pdfBytes = await createImprovedPDF(improvedText);

    // Return as base64
    const base64 = Buffer.from(pdfBytes).toString('base64');
    const dataUri = `data:application/pdf;base64,${base64}`;

    return NextResponse.json({
      success: true,
      originalText,
      improvedText,
      pdf: dataUri,
      filename: `CV_Improved_${new Date().toISOString().split('T')[0]}.pdf`,
    });
  } catch (error) {
    console.error("PDF improvement error:", error);
    return NextResponse.json({ error: "Failed to improve PDF" }, { status: 500 });
  }
}
