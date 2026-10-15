"""Package the current FE source using an allowlist; never include local env/build/tool state."""
from pathlib import Path
import hashlib
import json
import re
import zipfile

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'artifacts'
ROOT_FILES = {'package.json', 'package-lock.json', 'next.config.mjs', 'eslint.config.mjs',
              'postcss.config.mjs', 'jsconfig.json', 'components.json', '.gitignore', '.env.example'}
DIRECTORIES = ('src', 'public', 'tests', 'scripts')
FORBIDDEN = {'.git', '.next', 'node_modules', '.cache', '.vercel', '.aws', '.codex', '.agents',
             '.cursor', '.claude', '__pycache__', 'artifacts'}
SECRET_PATTERNS = [re.compile(rb'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----'),
                   re.compile(rb'AKIA[0-9A-Z]{16}'), re.compile(rb'ghp_[a-zA-Z0-9]{30,}'),
                   re.compile(rb'github_pat_[a-zA-Z0-9_]{30,}'),
                   re.compile(rb'eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}')]

def allowed(file):
    relative = file.relative_to(ROOT)
    if any(part in FORBIDDEN for part in relative.parts) or file.is_symlink():
        return False
    if file.name.startswith('.env'):
        return relative.as_posix() == '.env.example'
    return file.suffix.lower() not in {'.zip', '.log', '.pyc', '.pem', '.key', '.pfx', '.p12'}

def main():
    files = [p for p in ROOT.iterdir() if p.is_file() and (p.name in ROOT_FILES or p.suffix.lower() == '.md')]
    for directory in DIRECTORIES:
        files.extend(p for p in (ROOT / directory).rglob('*') if p.is_file())
    files = sorted({p for p in files if allowed(p)})
    findings = []
    for file in files:
        if file.suffix.lower() in {'.js', '.jsx', '.mjs', '.cjs', '.json', '.md', '.py'}:
            content = file.read_bytes()
            if any(pattern.search(content) for pattern in SECRET_PATTERNS):
                findings.append(file.relative_to(ROOT).as_posix())
    if findings:
        raise RuntimeError('Review potential secret patterns before packaging (values not printed): ' + ', '.join(findings))
    OUT.mkdir(exist_ok=True)
    archive = OUT / 'TotMart-FE-merchant-staging-2026-10-16.zip'
    with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as package:
        for file in files:
            package.write(file, file.relative_to(ROOT).as_posix())
    with zipfile.ZipFile(archive) as package:
        assert package.testzip() is None
        names = package.namelist()
        assert 'package.json' in names and 'src/app/manager/products/page.jsx' in names
        assert not any(any(part in FORBIDDEN for part in Path(name).parts) for name in names)
        assert all(not Path(name).name.startswith('.env') or name == '.env.example' for name in names)
    manifest = {'archive': archive.name, 'sha256': hashlib.sha256(archive.read_bytes()).hexdigest(),
                'files': len(files), 'bytes': archive.stat().st_size,
                'excluded': sorted(FORBIDDEN) + ['.env and other local env files', 'logs', 'private-key files'],
                'secretPatternScan': 'passed for selected text files; not a universal proof of absence',
                'entries': [file.relative_to(ROOT).as_posix() for file in files]}
    (OUT / 'TotMart-FE-merchant-staging-2026-10-16.manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
    print(json.dumps({key: value for key, value in manifest.items() if key != 'entries'}, indent=2))

if __name__ == '__main__':
    main()
