import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      if (!['node_modules', '.next', 'dist', 'build', '.git'].includes(file)) results = results.concat(walk(full));
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      results.push(full);
    }
  });
  return results;
}

const clientFiles = walk('c:/projects/Global-premium/Global-premium/client/src');
clientFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  const matches = [];
  lines.forEach((l, idx) => {
    // Look specifically for dollar sign used as currency
    if (
      l.includes('>$') || l.includes('"$') || l.includes("'$") || l.includes('`$') ||
      />\s*\$\s*\{/.test(l) ||
      /\$\s*\{\s*(?:product|item|order|price|amount|subtotal|total|val|discount|charge|delivery|ret|cost|v\.|p\.|Number|Math)/i.test(l) ||
      /\b(?:Price|Amount|Total|Charge|Refund|Cost|Paid)\s*\(\$\)/i.test(l) ||
      /\b(?:Under|Over|Save|Orders over|Total:)\s*\$\d+/i.test(l) ||
      /\$\d+(\.\d{2})?/.test(l)
    ) {
      if (
        !l.includes('style={{ animationDelay') &&
        !l.includes('font-family') &&
        !l.includes('import ') &&
        !l.includes('replace')
      ) {
        matches.push(`L${idx+1}: ${l.trim()}`);
      }
    }
  });
  if (matches.length > 0) {
    console.log(path.relative('c:/projects/Global-premium/Global-premium/client/src', f), `(${matches.length})`);
    matches.forEach(m => console.log('  ', m));
  }
});
