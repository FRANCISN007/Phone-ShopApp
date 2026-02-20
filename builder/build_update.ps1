# ============================================
# PhoneShopApp Professional Updater
# ============================================

# --- Require Admin ---
if (-not ([Security.Principal.WindowsPrincipal] `
    [Security.Principal.WindowsIdentity]::GetCurrent()
).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {

    Start-Process powershell "-ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    exit
}

$projectDir  = "C:\Users\KLOUNGE\Documents\PHONE_SHOP"
$frontendDir = Join-Path $projectDir "react-frontend"
$backendDir  = Join-Path $projectDir "app"
$installDir  = "C:\Program Files\PhoneShopApp"

Write-Host "=== Updating PhoneShopApp ===" -ForegroundColor Cyan

# --- Stop running backend ---
Write-Host "Stopping backend..." -ForegroundColor Yellow
Get-Process python, uvicorn -ErrorAction SilentlyContinue | Stop-Process -Force

# --- Build frontend ---
Write-Host "Building frontend..." -ForegroundColor Yellow
Set-Location $frontendDir
npm install
npm run build
if ($LASTEXITCODE -ne 0) { throw "Frontend build failed" }

# --- Replace frontend ---
$frontendTarget = Join-Path $installDir "react-frontend\build"
Remove-Item $frontendTarget -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item (Join-Path $frontendDir "build") $frontendTarget -Recurse -Force

# --- Update backend safely ---
Write-Host "Updating backend..." -ForegroundColor Yellow
robocopy $backendDir (Join-Path $installDir "app") /E /XD __pycache__ .git venv | Out-Null
Copy-Item (Join-Path $projectDir "start.py") (Join-Path $installDir "start.py") -Force

# --- Run migrations ---
Write-Host "Running DB migrations..." -ForegroundColor Yellow
Set-Location $installDir
python -m alembic upgrade head

# --- Restart server ---
Write-Host "Starting backend..." -ForegroundColor Green
Start-Process python (Join-Path $installDir "start.py")

Write-Host "=== UPDATE COMPLETE ===" -ForegroundColor Green
Pause
