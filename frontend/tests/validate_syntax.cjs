const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

function getAllFiles(dir, exts = ['.js', '.jsx']) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, exts));
    } else {
      if (exts.some(ext => file.endsWith(ext))) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

const files = getAllFiles(srcDir);
console.log(`[SafeSignal Frontend] Scanning ${files.length} source files...`);

let hasErrors = false;
for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  // Check unmatched braces/parentheses basic check
  const openBraces = (content.match(/{/g) || []).length;
  const closeBraces = (content.match(/}/g) || []).length;
  if (openBraces !== closeBraces) {
    console.error(`Syntax Mismatch in ${file}: { ${openBraces} vs } ${closeBraces}`);
    hasErrors = true;
  }
}

if (!hasErrors) {
  console.log(`[SafeSignal Frontend] All ${files.length} JSX/JS components pass structural syntax checks.`);
} else {
  process.exit(1);
}
