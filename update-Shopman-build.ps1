# ============================================
#  Phone Shop App - Builder & Updater
# ============================================

$AppName      = "Phone Shop App"
$ProjectRoot  = "C:\Users\KLOUNGE\Documents\PHONE_SHOP"
$FrontendDir  = Join-Path $ProjectRoot "react-frontend"
$BackendDir   = Join-Path $ProjectRoot "app"
$InstallDir   = "C:\Program Files\PhoneShopApp"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   $AppName - Builder & Updater" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# ---------------------------
# Validate paths
# ---------------------------
if (!(Test-Path $FrontendDir)) {
    Write-Host "[ERROR] React frontend not found!" -ForegroundColor Red
    exit 1
}

if (!(Test-Path $BackendDir)) {
    Write-Host "[ERROR] Backend app folder not found!" -ForegroundColor Red
    exit 1
}

# ---------------------------
# STEP 1: Build React frontend
# ---------------------------
Write-Host "Building React frontend..." -ForegroundColor Yellow
Set-Location $FrontendDir

npm install
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] React build failed. Aborting." -ForegroundColor Red
    exit 1
}

# ---------------------------
# STEP 2: Prepare install dirs
# ---------------------------
Write-Host "Preparing install directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
New-Item -ItemType Directory -Force -Path "$InstallDir\react-frontend" | Out-Null

# ---------------------------
# STEP 3: Replace frontend
# ---------------------------
$FrontendTarget = Join-Path $InstallDir "react-frontend\build"

if (Test-Path $FrontendTarget) {
    Write-Host "Removing old frontend build..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $FrontendTarget
}

Write-Host "Copying new frontend build..." -ForegroundColor Yellow
Copy-Item -Recurse -Force (Join-Path $FrontendDir "build") $FrontendTarget

# ---------------------------
# STEP 4: Replace backend
# ---------------------------
Write-Host "Updating backend files..." -ForegroundColor Yellow
Copy-Item -Recurse -Force $BackendDir (Join-Path $InstallDir "app")

Copy-Item -Force `
    (Join-Path $ProjectRoot "start.py") `
    (Join-Path $InstallDir "start.py")

# ---------------------------
# STEP 5: Copy .env safely
# ---------------------------
$EnvSource = Join-Path $ProjectRoot ".env"
$EnvTarget = Join-Path $InstallDir ".env"

if (Test-Path $EnvSource) {
    Copy-Item -Force $EnvSource $EnvTarget
    Write-Host "[OK] .env file copied." -ForegroundColor Green
} else {
    Write-Host "[WARN] .env file not found. Skipping..." -ForegroundColor Yellow
}

# ---------------------------
# DONE
# ---------------------------
Write-Host "============================================" -ForegroundColor Green
Write-Host "[SUCCESS] Phone Shop App updated successfully!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
