import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      if (!['node_modules', '.next', 'dist', 'build', '.git'].includes(file)) {
        results = results.concat(walk(full));
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      results.push(full);
    }
  });
  return results;
}

function checkDir(baseDir, label) {
  const files = walk(baseDir);
  const list = [];
  for (const f of files) {
    const content = fs.readFileSync(f, 'utf8');
    const lines = content.split('\n');
    let count = 0;
    const sample = [];
    lines.forEach((l, i) => {
      // Find currency $ instances
      if (
        (l.includes('$`') || l.includes('`$') || l.includes('>$') || l.includes('"$') || l.includes("'$") || /\$\d/.test(l) || /\$\s*\{/.test(l) || l.includes('($)')) &&
        !l.includes('style={{ animationDelay') &&
        !l.includes('font-family') &&
        !l.includes('key=') &&
        !l.includes('class') &&
        !l.includes('href=') &&
        !l.includes('id=') &&
        !l.includes('import ')
      ) {
        count++;
        if (sample.length < 3) sample.push(`L${i+1}: ${l.trim()}`);
      }
    });
    if (count > 0) {
      list.push({ file: path.relative(baseDir, f), count, sample });
    }
  }
  console.log(`\n=== ${label} (${list.length} files) ===`);
  list.forEach(item => {
    console.log(`- ${item.file} (${item.count} occurrences):`);
    item.sample.forEach(s => console.log(`    ${s}`));
  });
}

checkDir('c:/projects/Global-premium/Global-premium/client/src', 'Client Storefront');
checkDir('c:/projects/Global-premium/Global-premium/admin/src', 'Admin Panel');
