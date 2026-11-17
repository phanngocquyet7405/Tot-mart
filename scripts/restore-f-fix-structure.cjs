const { execSync } = require('child_process');
const fs = require('fs');

if (fs.existsSync('.git/index.lock')) {
  fs.unlinkSync('.git/index.lock');
}

const clientFiles = execSync('git ls-tree -r --name-only 6ecc0fe src/components/components_client', { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
const mainFiles = execSync('git ls-tree -r --name-only 6ecc0fe src/components/components_main', { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
const hookFiles = execSync('git ls-tree -r --name-only 6ecc0fe src/hooks', { encoding: 'utf8' }).trim().split('\n').filter(Boolean);

const toRestore = [];

for (const cf of clientFiles) {
  const rel = cf.replace('src/components/components_client/', '');
  const appPath = 'src/app/(client)/' + rel;
  let c1, c2;
  try { c1 = execSync('git show 6ecc0fe:' + cf, { encoding: 'utf8' }); } catch(e) { c1 = null; }
  try { c2 = execSync('git show 6ecc0fe:' + appPath, { encoding: 'utf8' }); } catch(e) { c2 = null; }
  if (!c1 || !c2 || c1 !== c2) {
    toRestore.push(cf);
  }
}

for (const mf of mainFiles) {
  if (mf.includes('testimonials') || mf.includes('brand-marquee')) continue;
  const base = mf.replace('src/components/components_main/', '');
  const boxPath = 'src/components_box/' + base;
  let c1, c2;
  try { c1 = execSync('git show 6ecc0fe:' + mf, { encoding: 'utf8' }); } catch(e) { c1 = null; }
  try { c2 = execSync('git show 6ecc0fe:' + boxPath, { encoding: 'utf8' }); } catch(e) { c2 = null; }
  if (!c1 || !c2 || c1 !== c2) {
    toRestore.push(mf);
  }
}

for (const hf of hookFiles) {
  toRestore.push(hf);
}

console.log('Restoring in one command, count:', toRestore.length);
execSync(`git checkout 6ecc0fe -- ${toRestore.map(f => `"${f}"`).join(' ')}`);
console.log('Done!');
