import report from './lighthouse-results/home.report.json' with { type: 'json' };

console.log('=== Lighthouse Scores ===');
console.log('Performance:', report.categories.performance.score * 100);
console.log('Accessibility:', report.categories.accessibility.score * 100);
console.log('Best Practices:', report.categories['best-practices'].score * 100);
console.log('SEO:', report.categories.seo.score * 100);

console.log('\n=== All Low Score Audits (score < 0.9) ===');
const lowScoreAudits = Object.entries(report.audits)
  .filter(([,v]) => v.score !== null && v.score < 0.9)
  .sort(([,a],[,b]) => a.score - b.score);

lowScoreAudits.forEach(([k, v]) => {
  console.log(`  ${k}: ${v.score}`);
  console.log(`    ${v.title}`);
  if (v.displayValue) console.log(`    Value: ${v.displayValue}`);
});

console.log('\n=== Unused JavaScript Details ===');
const unusedJsAudit = report.audits['unused-javascript'];
if (unusedJsAudit) {
  console.log(`  Score: ${unusedJsAudit.score}`);
  console.log(`  Display Value: ${unusedJsAudit.displayValue}`);
  if (unusedJsAudit.details?.items) {
    console.log(`  Top unused JS:`);
    unusedJsAudit.details.items.slice(0, 10).forEach(item => {
      console.log(`    - ${item.url}: ${item.wastedMs}ms (${item.wastedBytes} bytes)`);
    });
  }
}

console.log('\n=== Large JavaScript Files ===');
const jsAudit = report.audits['unminified-javascript'];
const scriptAudit = report.audits['third-party-summary'];
if (scriptAudit?.details?.items) {
  scriptAudit.details.items.forEach(item => {
    console.log(`    ${item.entity?.text || item.url}: ${item.blockingTime || 0}ms`);
  });
}
