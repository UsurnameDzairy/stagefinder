/**
 * Parser PDF robuste utilisant unpdf (basé sur Mozilla pdf.js)
 */

import { extractText } from 'unpdf';

/**
 * Extraire le texte d'un buffer PDF avec unpdf
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  console.log('📄 Starting PDF extraction with unpdf...');
  
  // Convertir le buffer en Uint8Array
  const data = new Uint8Array(buffer);
  
  // Extraire le texte avec unpdf
  const result = await extractText(data, { mergePages: true });
  
  const fullText = result.text || '';
  
  console.log(`📝 UNPDF extracted ${fullText.length} characters`);
  console.log(`📝 Preview: ${fullText.substring(0, 500)}`);
  
  return fullText;
}

/**
 * Nettoyer le texte extrait du PDF
 */
export function cleanExtractedText(text: string): string {
  if (!text) return '';
  
  return text
    // Normaliser les espaces
    .replace(/\s+/g, ' ')
    // Supprimer les caractères de contrôle
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Nettoyer les lignes
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n')
    .trim();
}
