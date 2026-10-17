const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('.env.example defaults to a local backend, never the shared deployment', () => {
  const value = /^API_URL=(.*)$/m.exec(read('.env.example'))?.[1].trim();
  assert.ok(value, 'API_URL must be set in .env.example');
  assert.match(new URL(value).hostname, /^(localhost|127\.0\.0\.1)$/);
});

test('a git-ignored AGENTS.md is not linked from tracked markdown', () => {
  const ignored = read('.gitignore').split(/\r?\n/).map(line => line.trim());
  assert.ok(ignored.includes('AGENTS.md'));
  const docs = ['README.md', ...fs.readdirSync(path.join(root, 'docs')).filter(name => name.endsWith('.md')).map(name => `docs/${name}`)];
  for (const file of docs) assert.doesNotMatch(read(file), /\]\((?:\.\.\/)?AGENTS\.md\)/, file);
});

test('local agent tooling directories are git-ignored', () => {
  const ignored = read('.gitignore').split(/\r?\n/).map(line => line.trim());
  for (const entry of ['.agents/', '.claude/', '.impeccable/', '.codex/']) assert.ok(ignored.includes(entry), entry);
});
