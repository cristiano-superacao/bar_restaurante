Param(
  [switch]$SkipDocker,
  [switch]$SkipInstall,
  [switch]$SkipMigrate,
  [switch]$SkipSeed,
  [switch]$BackendOnly,
  [switch]$FrontendOnly,
  [switch]$GeneratePasswords,
  [switch]$ForceEnv,
  [switch]$PromptDbPassword,
  [string]$DbHost = "localhost",
  [int]$DbPort = 5432,
  [string]$DbName = "bar_restaurante",
  [string]$DbUser,
  [string]$DatabaseUrl = "postgresql://bar:bar@localhost:5432/bar_restaurante",
  [string]$CorsOrigin = "*",
  [string]$JwtSecret,
  [string]$SuperAdminPassword,
  [string]$AdminPassword
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Step([string]$msg) {
  Write-Host "`n==> $msg" -ForegroundColor Cyan
}

function Ensure-Command([string]$name, [string]$hint) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "Comando '$name' não encontrado. $hint"
  }
}

function New-RandomHex([int]$bytes = 32) {
  $buffer = New-Object byte[] $bytes
  [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($buffer)
  return -join ($buffer | ForEach-Object { $_.ToString('x2') })
}

function UrlEncode([string]$value) {
  if ($null -eq $value) { return "" }
  return [System.Uri]::EscapeDataString([string]$value)
}

function Get-PlainTextFromSecure([System.Security.SecureString]$secure) {
  if ($null -eq $secure) { return "" }
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  }
}

function Ensure-ServerEnv([string]$serverDir, [bool]$PersistSeedSecrets) {
  $envPath = Join-Path $serverDir '.env'
  $examplePath = Join-Path $serverDir '.env.example'

  if ((Test-Path $envPath) -and (-not $ForceEnv)) {
    Write-Host "Usando $envPath" -ForegroundColor DarkGray
    return
  }

  if (-not (Test-Path $examplePath)) {
    throw "Não encontrei $examplePath."
  }

  $secret = $JwtSecret
  if (-not $secret) {
    $secret = New-RandomHex 32
  }

  $allowInsecure = $true
  if ($SuperAdminPassword -or $AdminPassword) {
    $allowInsecure = $false
  }

  $superPass = if ($PersistSeedSecrets -and $SuperAdminPassword) { $SuperAdminPassword } else { "" }
  $adminPass = if ($PersistSeedSecrets -and $AdminPassword) { $AdminPassword } else { "" }

  $content = @(
"# Arquivo gerado por scripts/setup-local.ps1",
"# NÃO commite este arquivo.",
"",
"DATABASE_URL=$DatabaseUrl",
"JWT_SECRET=$secret",
"PORT=3000",
"NODE_ENV=development",
"CORS_ORIGIN=$CorsOrigin",
"",
"# Seed (apenas DEV)",
"ALLOW_SEED=false",
"ALLOW_INSECURE_SEED=$($allowInsecure.ToString().ToLower())",
"SEED_SUPERADMIN_PASSWORD=$superPass",
"SEED_ADMIN_PASSWORD=$adminPass"
  ) -join "`n"

  Set-Content -Path $envPath -Value $content -Encoding UTF8

  Write-Host "Criado $envPath" -ForegroundColor Green
  if ($allowInsecure) {
    Write-Host "Seed poderá usar senhas padrão (somente local)." -ForegroundColor Yellow
    Write-Host "- superadmin: superadmin / superadmin123" -ForegroundColor Yellow
    Write-Host "- admin_demo: admin_demo / admin12345" -ForegroundColor Yellow
  } else {
    if ($PersistSeedSecrets) {
      Write-Host "Seed usará as senhas informadas via parâmetros (persistidas no .env)." -ForegroundColor Green
    } else {
      Write-Host "Seed usará senhas informadas/geradas apenas na execução (não persistidas no .env)." -ForegroundColor Green
    }
  }
}

function Assert-LastExitOk([string]$step) {
  if ($LASTEXITCODE -ne 0) {
    throw "Falha no passo: $step (exit code $LASTEXITCODE)."
  }
}

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$serverDir = Join-Path $repoRoot 'server'

Write-Step "Verificando pré-requisitos"
Ensure-Command node "Instale Node.js 18+ e reinicie o terminal."
Ensure-Command npm "Instale Node.js (vem com npm) e reinicie o terminal."

# Monta DATABASE_URL a partir de parâmetros (evita colocar senha em texto claro na linha de comando)
if ($DbUser -and $PromptDbPassword) {
  $secure = Read-Host "Senha do PostgreSQL para o usuário '$DbUser' (não será exibida)" -AsSecureString
  $plain = Get-PlainTextFromSecure $secure

  $u = UrlEncode $DbUser
  $p = UrlEncode $plain
  $h = UrlEncode $DbHost
  $d = UrlEncode $DbName

  $DatabaseUrl = "postgresql://${u}:${p}@${h}:${DbPort}/${d}"
}

if ($GeneratePasswords) {
  if (-not $SuperAdminPassword) {
    # 16 bytes hex = 32 chars
    $SuperAdminPassword = New-RandomHex 16
  }
  if (-not $AdminPassword) {
    $AdminPassword = New-RandomHex 16
  }

  $credPath = Join-Path $serverDir '.local-credentials.txt'
  $credContent = @(
    "# Credenciais geradas automaticamente (DEV)",
    "# NÃO commite este arquivo.",
    "superadmin.username=superadmin",
    "superadmin.password=$SuperAdminPassword",
    "admin_demo.username=admin_demo",
    "admin_demo.password=$AdminPassword",
    "generatedAt=$(Get-Date -Format o)"
  ) -join "`n"
  Set-Content -Path $credPath -Value $credContent -Encoding UTF8
  Write-Host "Credenciais salvas em: $credPath" -ForegroundColor Yellow
}

# Se as senhas foram geradas automaticamente, por padrão não persistimos no .env.
$persistSeedSecrets = $true
if ($GeneratePasswords) { $persistSeedSecrets = $false }

if (-not $FrontendOnly) {
  Ensure-ServerEnv -serverDir $serverDir -PersistSeedSecrets $persistSeedSecrets
}

if (-not $SkipDocker -and -not $FrontendOnly) {
  Write-Step "Subindo PostgreSQL via Docker (server/docker-compose.yml)"
  Ensure-Command docker "Instale o Docker Desktop e garanta que ele esteja rodando."

  Push-Location $serverDir
  try {
    docker compose up -d
  } finally {
    Pop-Location
  }
}

if (-not $SkipInstall) {
  if (-not $FrontendOnly) {
    Write-Step "Instalando dependências do backend"
    Push-Location $serverDir
    try {
      npm install
      Assert-LastExitOk "npm install (server)"
    } finally {
      Pop-Location
    }
  }

  if (-not $BackendOnly) {
    Write-Step "Instalando dependências do frontend"
    Push-Location $repoRoot
    try {
      npm install
      Assert-LastExitOk "npm install (frontend)"
    } finally {
      Pop-Location
    }
  }
}

if (-not $SkipMigrate -and -not $FrontendOnly) {
  Write-Step "Rodando migrações (server)"
  Push-Location $serverDir
  try {
    npm run migrate
    Assert-LastExitOk "npm run migrate"
  } finally {
    Pop-Location
  }
}

if (-not $SkipSeed -and -not $FrontendOnly) {
  Write-Step "Rodando seed (server)"
  Push-Location $serverDir
  try {
    if ($SuperAdminPassword) { $env:SEED_SUPERADMIN_PASSWORD = $SuperAdminPassword }
    if ($AdminPassword) { $env:SEED_ADMIN_PASSWORD = $AdminPassword }
    npm run seed
    Assert-LastExitOk "npm run seed"
  } finally {
    if ($GeneratePasswords) {
      Remove-Item Env:SEED_SUPERADMIN_PASSWORD -ErrorAction SilentlyContinue
      Remove-Item Env:SEED_ADMIN_PASSWORD -ErrorAction SilentlyContinue
    }
    Pop-Location
  }
}

if (-not $FrontendOnly) {
  Write-Step "Iniciando backend (server/npm run dev)"
  Start-Process -FilePath "powershell" -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location -LiteralPath '$serverDir'; npm run dev"
  ) | Out-Null
}

if (-not $BackendOnly) {
  Write-Step "Iniciando frontend (npm run dev)"
  Start-Process -FilePath "powershell" -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location -LiteralPath '$repoRoot'; npm run dev"
  ) | Out-Null
}

Write-Step "Pronto"
Write-Host "- Backend: http://localhost:3000" -ForegroundColor Green
Write-Host "- Frontend: veja a URL exibida no terminal (porta 8000/8001/8002...)" -ForegroundColor Green
Write-Host "Abra Configurações → Conexão com API e clique em 'Usar Local (localhost:3000)'" -ForegroundColor Green

if ($GeneratePasswords) {
  Write-Host "Use o arquivo server/.local-credentials.txt para ver as credenciais." -ForegroundColor Yellow
}
