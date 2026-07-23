import fs from 'fs';

const filePath = String.raw`C:\Users\rebui\AppData\Local\Temp\react-doctor-d09522cd-4e39-4cfa-afe6-ab7e29a19a8a\diagnostics.json`;
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// All control-has-associated-label findings, sorted by file then line
const items = data.filter(d => d.rule === 'control-has-associated-label');
items.sort((a, b) => a.filePath.localeCompare(b.filePath) || a.line - b.line);

// Group by file
const byFile = {};
for (const it of items) {
  (byFile[it.filePath] ||= []).push(it);
}

const projectRoot = String.raw`D:\0_inbox\my-web-2025`;
for (const [file, findings] of Object.entries(byFile)) {
  console.log('========================================');
  console.log('FILE: ' + file + '  (' + findings.length + ' sites)');
  console.log('========================================');
  const abs = projectRoot + '\\' + file.replace(/\//g, '\\');
  const src = fs.readFileSync(abs, 'utf8');
  const lines = src.split('\n');
  for (const f of findings) {
    // Show 6 lines of context around the line
    const start = Math.max(0, f.line - 4);
    const end = Math.min(lines.length, f.line + 6);
    console.log(`\n--- line ${f.line}, col ${f.column} (length ${f.length}) ---`);
    for (let i = start; i < end; i++) {
      const marker = (i + 1 === f.line) ? '>>' : '  ';
      console.log(`${marker} ${(i+1).toString().padStart(4)}: ${lines[i]}`);
    }
  }
}
