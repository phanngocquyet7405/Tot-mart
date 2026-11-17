const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== Checking 4 hooks ===');
const hooks = [
  { name: 'use-mobile', src: 'src/hooks/use-mobile.js', app: 'src/app/hook/use-mobile.js' },
  { name: 'useBoxProducts', src: 'src/hooks/useBoxProducts.js', app: 'src/app/hook/useBoxProducts.js' },
  { name: 'usePlanList', src: 'src/hooks/usePlanList.js', app: 'src/app/hook/adminSub/usePlanList.js' },
  { name: 'useTemplateForm', src: 'src/hooks/useTemplateForm.js', app: 'src/app/hook/adminSub/useTemplateForm.js' }
];

for (const h of hooks) {
  const srcExists = fs.existsSync(h.src);
  const appExists = fs.existsSync(h.app);
  console.log(`\n--- ${h.name} ---`);
  console.log(`  src/hooks exists: ${srcExists}, app exists: ${appExists}`);
  if (srcExists && appExists) {
    const srcContent = fs.readFileSync(h.src, 'utf8');
    const appContent = fs.readFileSync(h.app, 'utf8');
    console.log(`  Identical content: ${srcContent.trim() === appContent.trim()}`);
    // Check if src is a re-export bridge
    if (srcContent.includes('export *') || srcContent.includes('export {')) {
      console.log(`  src/hooks is re-export bridge: true`);
    }
  }
  // Check imports across codebase
  const grep = execSync(`git grep -n "${h.name}"`, { encoding: 'utf8' }).trim();
  console.log(`  Imports:\n${grep.split('\n').map(l => '    ' + l).join('\n')}`);
}
