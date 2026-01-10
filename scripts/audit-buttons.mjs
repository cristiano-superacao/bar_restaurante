import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();

function listRootHtmlFiles() {
  return fs
    .readdirSync(rootDir, { withFileTypes: true })
    .filter((d) => d.isFile() && d.name.toLowerCase().endsWith('.html'))
    .map((d) => d.name)
    .filter((name) => name.toLowerCase() !== 'index.html'); // login é especial
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function unique(arr) {
  return [...new Set(arr)];
}

function extractScriptSrcs(html) {
  const results = [];
  const re = /<script[^>]+src\s*=\s*"([^"]+)"[^>]*>/gi;
  let match;
  while ((match = re.exec(html))) {
    results.push(match[1]);
  }
  return results;
}

function extractClickableIds(html) {
  const ids = [];

  // button / a / input
  const re = /<(button|a|input)[^>]*\sid\s*=\s*"([^"]+)"[^>]*>/gi;
  let match;
  while ((match = re.exec(html))) {
    const tag = match[1].toLowerCase();
    const id = match[2].trim();
    if (!id) continue;

    // Heurística: ids que geralmente precisam de handler
    const looksInteractive =
      id === 'menu-toggle' ||
      id === 'sidebar-overlay' ||
      id === 'logout-btn' ||
      id.endsWith('-btn') ||
      id.includes('toggle') ||
      id.includes('modal') ||
      id.includes('close') ||
      id.includes('save') ||
      id.includes('delete') ||
      id.includes('edit') ||
      id.includes('add-');

    // inputs podem ser só form; então filtramos mais
    if (tag === 'input' && !id.endsWith('-btn') && !id.includes('toggle')) continue;

    if (looksInteractive) ids.push(id);
  }

  return unique(ids);
}

function fileExists(rel) {
  return fs.existsSync(path.join(rootDir, rel));
}

function jsReferencesId(jsText, id) {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Strings comuns
  const patterns = [
    new RegExp(`getElementById\(\s*['\"]${escaped}['\"]\s*\)`, 'i'),
    new RegExp(`querySelector\(\s*['\"]#${escaped}['\"]\s*\)`, 'i'),
    new RegExp(`querySelectorAll\(\s*['\"]#${escaped}['\"]\s*\)`, 'i'),
    new RegExp(`\b${escaped}\b`, 'i'),
  ];

  return patterns.some((p) => p.test(jsText));
}

function main() {
  const htmlFiles = listRootHtmlFiles();
  const findings = [];

  for (const htmlFile of htmlFiles) {
    const htmlPath = path.join(rootDir, htmlFile);
    const html = readText(htmlPath);

    const scriptSrcs = extractScriptSrcs(html)
      .filter((src) => src.startsWith('js/'))
      .filter((src) => fileExists(src));

    const jsTexts = scriptSrcs.map((src) => readText(path.join(rootDir, src)));
    const clickableIds = extractClickableIds(html);

    const missing = clickableIds.filter((id) => !jsTexts.some((t) => jsReferencesId(t, id)));

    findings.push({ htmlFile, scriptSrcs, clickableIds, missing });
  }

  const totalMissing = findings.reduce((acc, f) => acc + f.missing.length, 0);

  console.log('=== Auditoria de botões/IDs (heurística) ===');
  console.log(`Arquivos HTML analisados: ${findings.length}`);
  console.log(`Possíveis IDs sem handler: ${totalMissing}`);

  for (const f of findings) {
    if (f.missing.length === 0) continue;

    console.log(`\n- ${f.htmlFile}`);
    console.log(`  Scripts: ${f.scriptSrcs.join(', ') || '(nenhum)'}`);
    console.log(`  Suspeitos: ${f.missing.join(', ')}`);
  }

  process.exitCode = totalMissing > 0 ? 2 : 0;
}

main();
