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

function hasDashboardCssLink(html) {
  return /<link[^>]+href=["']css\/dashboard\.css["'][^>]*>/i.test(html);
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
  const req = [
    /\.btn\s*\{/,
    /\.btn-primary\s*\{/,
    /\.btn-secondary\s*\{/,
    /\.btn-danger\s*\{/
  ];
  return req.map((r) => r.test(baseCss));
}

function dashboardOverridesButtons(dashboardCss) {
  // sinaliza se houver seletor genérico .btn { ... } (não qualificado)
  return /(^|\n)\s*\.btn\s*\{/.test(dashboardCss);
}

function main() {
  const issues = [];
  const warnings = [];

  const htmlFiles = listHtmlFiles();
  const baseCssPath = path.join(rootDir, 'css', 'base.css');
  const dashboardCssPath = path.join(rootDir, 'css', 'dashboard.css');

  const baseCss = fs.existsSync(baseCssPath) ? readText(baseCssPath) : '';
  const dashboardCss = fs.existsSync(dashboardCssPath) ? readText(dashboardCssPath) : '';

  const [hasBtn, hasPrimary, hasSecondary, hasDanger] = checkBaseCssSelectors(baseCss);
  if (!hasBtn || !hasPrimary || !hasSecondary || !hasDanger) {
    issues.push({ file: 'css/base.css', message: 'Faltam seletores obrigatórios (.btn/.btn-primary/.btn-secondary/.btn-danger)' });
  }

  if (dashboardOverridesButtons(dashboardCss)) {
    warnings.push({ file: 'css/dashboard.css', message: 'Encontrado seletor genérico .btn — pode causar conflito. (esperado: sem .btn genérico)' });
  }

  for (const htmlName of htmlFiles) {
    const html = readText(path.join(rootDir, htmlName));
    const hasBase = hasBaseCssLink(html);
    const hasDash = hasDashboardCssLink(html);
    const btnUsages = findBtnClasses(html);

    if (btnUsages.length > 0 && !hasBase) {
      issues.push({ file: htmlName, message: 'Usa classes .btn* mas não inclui css/base.css no <head>' });
    }
    if (hasDash && !hasBase) {
      warnings.push({ file: htmlName, message: 'Inclui css/dashboard.css sem css/base.css — pode perder estilos compartilhados' });
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
