import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();

function listHtmlFiles() {
  return fs
    .readdirSync(rootDir, { withFileTypes: true })
    .filter((d) => d.isFile() && d.name.toLowerCase().endsWith('.html'))
    .map((d) => d.name)
    .sort();
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function hasBaseCssLink(html) {
  return /<link[^>]+href=["']css\/base\.css["'][^>]*>/i.test(html);
}

function hasDesignSystemCssLink(html) {
  return /<link[^>]+href=["']css\/design-system\.css["'][^>]*>/i.test(html);
}

function hasSidebarCssLink(html) {
  return /<link[^>]+href=["']css\/sidebar-verde\.css["'][^>]*>/i.test(html);
}

function hasCupomCssLink(html) {
  return /<link[^>]+href=["']css\/cupom\.css["'][^>]*>/i.test(html);
}

function findBtnClasses(html) {
  // Captura qualquer class="..." que contenha uma palavra btn
  const results = [];
  const re = /class\s*=\s*"([^"]*)"/gi;
  let m;
  while ((m = re.exec(html))) {
  const classes = m[1].split(/\s+/);
  const hasStdBtn = classes.some((c) => c === 'btn' || /^btn-/.test(c));
  if (hasStdBtn) results.push(classes.join(' '));
  }
  return results;
}

function checkBaseCssSelectors(baseCss) {
  const hasBtn = /\.btn\s*\{/.test(baseCss);
  const hasPrimary = /\.btn-primary\s*\{/.test(baseCss);
  const hasSecondary = /\.btn-secondary\s*\{/.test(baseCss);
  // Aceita .btn-ghost como substituto moderno de .btn-danger
  const hasDangerOrGhost = /\.btn-danger\s*\{|\.btn-ghost\s*\{/.test(baseCss);
  return [hasBtn, hasPrimary, hasSecondary, hasDangerOrGhost];
}

function sidebarOverridesButtons(sidebarCss) {
  // sinaliza se houver seletor genérico .btn { ... } fora do design system
  return /(^|\n)\s*\.btn\s*\{/.test(sidebarCss);
}

function main() {
  const issues = [];
  const warnings = [];

  const htmlFiles = listHtmlFiles();
  const baseCssPath = path.join(rootDir, 'css', 'design-system.css');
  const fallbackBaseCssPath = path.join(rootDir, 'css', 'base.css');
  const sidebarCssPath = path.join(rootDir, 'css', 'sidebar-verde.css');

  let baseCss = '';
  if (fs.existsSync(baseCssPath)) {
    baseCss = readText(baseCssPath);
  } else if (fs.existsSync(fallbackBaseCssPath)) {
    baseCss = readText(fallbackBaseCssPath);
  }
  const sidebarCss = fs.existsSync(sidebarCssPath) ? readText(sidebarCssPath) : '';

  const [hasBtn, hasPrimary, hasSecondary, hasDanger] = checkBaseCssSelectors(baseCss);
  if (!hasBtn || !hasPrimary || !hasSecondary || !hasDanger) {
    issues.push({ file: 'css/design-system.css', message: 'Faltam seletores obrigatórios (.btn/.btn-primary/.btn-secondary e .btn-danger ou .btn-ghost)' });
  }

  if (sidebarOverridesButtons(sidebarCss)) {
    // Aviso leve: apenas se houver declaração genérica de .btn fora do design system
    warnings.push({ file: 'css/sidebar-verde.css', message: 'Encontrado seletor genérico .btn — evite sobrescrever o design system aqui.' });
  }

  for (const htmlName of htmlFiles) {
    const html = readText(path.join(rootDir, htmlName));
    const hasBase = hasBaseCssLink(html);
    const hasDesign = hasDesignSystemCssLink(html);
    const hasSidebar = hasSidebarCssLink(html);
    const btnUsages = findBtnClasses(html);

    if (btnUsages.length > 0 && !(hasBase || hasDesign)) {
      issues.push({ file: htmlName, message: 'Usa classes .btn* mas não inclui css/design-system.css no <head>' });
    }
    if (hasSidebar && !(hasBase || hasDesign)) {
      warnings.push({ file: htmlName, message: 'Inclui css/sidebar-verde.css sem css/design-system.css — pode perder estilos compartilhados' });
    }

    if (htmlName.toLowerCase() === 'cupom.html') {
      // Cupom deve usar .receipt-btn e incluir cupom.css
      const usesReceiptBtn = /class\s*=\s*"[^"]*\breceipt-btn\b/.test(html);
      const hasCupomCss = hasCupomCssLink(html);
      if (!usesReceiptBtn) {
        warnings.push({ file: htmlName, message: 'Cupom deveria usar .receipt-btn para evitar conflito com .btn global' });
      }
      if (!hasCupomCss) {
        issues.push({ file: htmlName, message: 'Cupom não inclui css/cupom.css — estilos específicos podem faltar' });
      }
    }
  }

  // Saída
  const print = (label, entries) => {
    if (entries.length === 0) return;
    console.log(`\n${label}:`);
    for (const e of entries) {
      console.log(`- ${e.file}: ${e.message}`);
    }
  };

  print('Issues', issues);
  print('Warnings', warnings);

  if (issues.length === 0 && warnings.length === 0) {
    console.log('\n✔ Validação concluída: nenhum problema encontrado.');
    process.exit(0);
  } else if (issues.length === 0) {
    console.log('\n▲ Validação concluída: apenas avisos.');
    process.exit(0);
  } else {
    console.log('\n✖ Validação encontrou problemas.');
    process.exit(1);
  }
}

main();
