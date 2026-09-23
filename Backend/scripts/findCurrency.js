import fs from 'fs';
import path from 'path';

function walk(dir, ext = ['.tsx', '.jsx', '.ts', '.js']) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (!['node_modules', '.next', 'dist', 'build', '.git'].includes(file)) {
        results = results.concat(walk(fullPath, ext));
      }
    } else {
      if (ext.some(e => file.endsWith(e))) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

const clientFiles = walk('c:/projects/Global-premium/Global-premium/client/src');
const adminFiles = walk('c:/projects/Global-premium/Global-premium/admin/src');

console.log(`Found ${clientFiles.length} client files, ${adminFiles.length} admin files.`);

const currencyRegex = /(\$\d|`[^`]*\$(\{|[0-9])|['"][^'"]*\$[^'"]*['"]|>\s*\$|\$\s*\{)/;

function analyzeFiles(files, label) {
  console.log(`\n=== ${label} ===`);
  let totalMatches = 0;
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    const matchingLines = [];
    lines.forEach((line, idx) => {
      // Ignore imports, comments, or standard template literals without currency context
      if (
        line.includes('$') &&
        (
          line.includes('Price') ||
          line.includes('price') ||
          line.includes('Total') ||
          line.includes('total') ||
          line.includes('amount') ||
          line.includes('Amount') ||
          line.includes('discount') ||
          line.includes('Discount') ||
          line.includes('charge') ||
          line.includes('Charge') ||
          line.includes('revenue') ||
          line.includes('Revenue') ||
          line.includes('sales') ||
          line.includes('Sales') ||
          line.includes('cost') ||
          line.includes('Cost') ||
          line.includes('subtotal') ||
          line.includes('Subtotal') ||
          line.includes('refund') ||
          line.includes('Refund') ||
          line.includes('(\$)') ||
          line.includes('($)') ||
          /\$\s*\{/.test(line) ||
          /\$\d/.test(line)
        )
      ) {
        // Filter out non-currency template strings like `wishlist-item-${index}` or `${base}${path}`
        if (
          !line.includes('`${') ||
          line.includes('$`') ||
          line.includes('`$') ||
          line.includes('${order.total') ||
          line.includes('${product.price') ||
          line.includes('${item.price') ||
          line.includes('${price') ||
          line.includes('${amount') ||
          line.includes('${subtotal') ||
          line.includes('${total') ||
          line.includes('${ret.refund') ||
          line.includes('${c.discount') ||
          line.includes('${v.sellingPrice') ||
          line.includes('${k.val') ||
          line.includes('toFixed')
        ) {
          matchingLines.push({ lineNum: idx + 1, text: line.trim() });
        }
      }
    });
    if (matchingLines.length > 0) {
      console.log(`\nFile: ${path.basename(file)} (${matchingLines.length} matches)`);
      matchingLines.slice(0, 5).forEach(m => console.log(`  L${m.lineNum}: ${m.text.substring(0, 100)}`));
      if (matchingLines.length > 5) console.log(`  ... and ${matchingLines.length - 5} more`);
      totalMatches += matchingLines.length;
    }
  }
  console.log(`Total potential currency matches in ${label}: ${totalMatches}`);
}

analyzeFiles(clientFiles, 'Client Storefront');
analyzeFiles(adminFiles, 'Admin Panel');
