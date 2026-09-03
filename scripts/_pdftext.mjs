// Dump text of a PDF page range (1-based) for key extraction.
// Usage: node scripts/_pdftext.mjs "<file>" [start] [end]
import { readFileSync } from 'node:fs';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

const [file, startArg, endArg] = process.argv.slice(2);
const data = new Uint8Array(readFileSync(file));
const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;
const start = Number(startArg || 1);
const end = Math.min(Number(endArg || doc.numPages), doc.numPages);
console.error(`pages: ${doc.numPages}, dumping ${start}-${end}`);
for (let p = start; p <= end; p++) {
  const page = await doc.getPage(p);
  const tc = await page.getTextContent();
  console.log(`--- PAGE ${p} ---`);
  console.log(tc.items.map((it) => it.str).join(' '));
}
