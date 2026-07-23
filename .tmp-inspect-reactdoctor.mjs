import fs from 'fs';

const filePath = String.raw`C:\Users\rebui\AppData\Local\Temp\react-doctor-d09522cd-4e39-4cfa-afe6-ab7e29a19a8a\diagnostics.json`;
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Look at one sample diagnostic's full structure
console.log('=== Sample diagnostic (control-has-associated-label) ===');
const sample = data.find(d => d.rule === 'control-has-associated-label');
console.log(JSON.stringify(sample, null, 2));

// Look at fixGroupId pattern
console.log('\n=== fixGroupId analysis for control-has-associated-label ===');
const ctrlLbl = data.filter(d => d.rule === 'control-has-associated-label');
const byGroup = {};
for (const d of ctrlLbl) {
  const g = d.fixGroupId || '(none)';
  byGroup[g] = (byGroup[g] || 0) + 1;
}
console.log('Unique fixGroupIds:', Object.keys(byGroup).length);
console.log('Distribution:');
for (const [g, c] of Object.entries(byGroup).sort((a, b) => b[1] - a[1]).slice(0, 15)) {
  console.log('  ' + c + 'x  ' + g);
}

// Look at unused-dependency sample
console.log('\n=== Sample unused-dependency ===');
console.log(JSON.stringify(data.find(d => d.rule === 'unused-dependency'), null, 2));

// Look at unused-dev-dependency sample
console.log('\n=== Sample unused-dev-dependency ===');
console.log(JSON.stringify(data.find(d => d.rule === 'unused-dev-dependency'), null, 2));
