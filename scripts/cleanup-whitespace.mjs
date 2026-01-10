import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();

const INCLUDE_EXT = new Set(['.html', '.css', '.js', '.mjs', '.json', '.md']);
const EXCLUDE_DIRS = new Set(['node_modules', '.git', '.playwright-mcp']);

function shouldExcludeDir(name) {
  return EXCLUDE_DIRS.has(name);
}

function walk(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (shouldExcludeDir(e.name)) continue;
      walk(p, out);
    } else if (e.isFile()) {
      const ext = path.extname(e.name).toLowerCase();
      if (INCLUDE_EXT.has(ext)) out.push(p);
    }
  }
  return out;
}

function normalizeText(text) {
  // Normalize line endings to \n in memory (preserve as \n on write)
  let s = text.replace(/\r\n/g, '\n');

  // Remove trailing whitespace on every line
  s = s
    .split('\n')
    .map((line) => line.replace(/[\t ]+$/g, ''))
    .join('\n');

  // Remove whitespace-only lines (convert to empty)
  s = s.replace(/\n[\t ]+\n/g, '\n\n');

  // Trim excessive blank lines at EOF
  s = s.replace(/\n{3,}$/g, '\n\n');

  // Ensure exactly one newline at EOF
  s = s.replace(/\n*$/g, '\n');

  return s;
}

function main() {
  const files = walk(rootDir);
  let changed = 0;

  for (const filePath of files) {
    const before = fs.readFileSync(filePath, 'utf8');
    const after = normalizeText(before);
    if (after !== before.replace(/\r\n/g, '\n')) {
      fs.writeFileSync(filePath, after, 'utf8');
      changed++;
    }
  }

  console.log(`Whitespace cleanup: ${changed} arquivo(s) ajustado(s).`);
}

main();

