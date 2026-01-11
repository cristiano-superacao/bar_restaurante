import fs from 'node:fs';
import path from 'node:path';

const cssDir = path.join(process.cwd(), 'css');

function listCssFiles() {
  return fs.readdirSync(cssDir).filter(f => f.endsWith('.css')).map(f => path.join(cssDir, f));
}

function extractSelectors(css) {
  const selectors = new Map();
  // naive parse: split by '{' and get selector part
  const blocks = css.split('{');
  for (let i = 0; i < blocks.length - 1; i++) {
    const head = blocks[i].trim();
    // get last semicolon block or newline before previous '}'
    const selector = head.split('}').pop().trim();
    if (!selector) continue;
    // handle comma-separated selectors
    selector.split(',').map(s => s.trim()).forEach(s => {
      // ignore @ rules and keyframes
      if (s.startsWith('@') || s.startsWith(':root') || s.startsWith('from') || s.startsWith('to')) return;
      // normalize whitespace
      const key = s.replace(/\s+/g, ' ');
      selectors.set(key, (selectors.get(key) || 0) + 1);
    });
  }
  return selectors;
}

function main() {
  const files = listCssFiles();
  const globalSelectors = new Map();
  const perFile = new Map();

  for (const file of files) {
    const css = fs.readFileSync(file, 'utf8');
    const sels = extractSelectors(css);
    perFile.set(file, sels);
    for (const [sel, count] of sels) {
      const entry = globalSelectors.get(sel) || { files: new Set(), count: 0 };
      entry.files.add(path.basename(file));
      entry.count += count;
      globalSelectors.set(sel, entry);
    }
  }

  const duplicates = [];
  for (const [sel, info] of globalSelectors) {
    if (info.files.size > 1) {
      duplicates.push({ selector: sel, files: Array.from(info.files).sort() });
    }
  }

  duplicates.sort((a,b) => a.selector.localeCompare(b.selector));

  if (duplicates.length === 0) {
    console.log('✔ Nenhuma duplicidade de seletor encontrada entre arquivos CSS.');
    return;
  }

  console.log('Duplicidades de seletores (aparecem em múltiplos arquivos CSS):');
  for (const d of duplicates) {
    console.log(`- ${d.selector}: ${d.files.join(', ')}`);
  }

  // Sugestões rápidas
  const suggest = [];
  const knownShared = ['.modal', '.modal-content', '.modal-header', '.close-btn', '.form-group', '.toolbar'];
  for (const k of knownShared) {
    const dup = duplicates.find(d => d.selector === k);
    if (dup) suggest.push(`Mover ${k} para css/base.css e remover dos arquivos: ${dup.files.join(', ')}`);
  }

  if (suggest.length) {
    console.log('\nSugestões:');
    for (const s of suggest) console.log(`- ${s}`);
  }
}

main();
