// Script de test pour l'extraction PDF
const fs = require('fs');
const path = require('path');

async function testPdfExtraction() {
  // Utiliser le dernier CV uploadé
  const cvPath = '/Users/ghost/Desktop/stagefinder-app/public/uploads/cv/cv-V3txzSCPCmA6HegH3Or2cDy4YwnzBtpK-1769184495461.pdf';
  
  console.log('📄 Testing PDF extraction...');
  console.log('File:', cvPath);
  
  const buffer = fs.readFileSync(cvPath);
  console.log('Buffer size:', buffer.length, 'bytes');
  
  // Test 1: unpdf
  try {
    const { extractText } = await import('unpdf');
    const data = new Uint8Array(buffer);
    const result = await extractText(data, { mergePages: true });
    console.log('\n✅ UNPDF Result:');
    console.log('Text length:', result.text?.length || 0);
    console.log('Preview:', result.text?.substring(0, 1000));
  } catch (error) {
    console.log('\n❌ UNPDF Error:', error.message);
  }
  
  // Test 2: pdf-parse
  try {
    const pdf = require('pdf-parse/lib/pdf-parse.js');
    const pdfData = await pdf(buffer);
    console.log('\n✅ PDF-PARSE Result:');
    console.log('Text length:', pdfData.text?.length || 0);
    console.log('Preview:', pdfData.text?.substring(0, 1000));
  } catch (error) {
    console.log('\n❌ PDF-PARSE Error:', error.message);
  }
}

testPdfExtraction().catch(console.error);
