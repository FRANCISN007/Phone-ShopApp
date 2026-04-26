# ============================================

# PhoneShopApp Professional Updater (CLEAN FINAL)

# ============================================

# ---------- REQUIRE ADMIN ----------

if (-not ([Security.Principal.WindowsPrincipal] `
[Security.Principal.WindowsIdentity]::GetCurrent()
).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {

```
Start-Process powershell "-ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
exit
```

}

# ---------- CONFIG ----------

$projectDir  = "C:\Users\KLOUNGE\Documents\PHONE_SHOP"
$frontendDir = Join-Path $projectDir "react-frontend"
$backendDir  = Join-Path $projectDir "app"
$installDir  = "C:\Program Files\PhoneShopApp"

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   PhoneShopApp Updating..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# ---------- STOP BACKEND ----------

Write-Host "[STEP] Stopping backend..." -ForegroundColor Yellow
Get-Process python, uvicorn -ErrorAction SilentlyContinue | Stop-Process -Force

# ---------- BUILD FRONTEND ----------

Write-Host "[STEP] Building frontend..." -ForegroundColor Yellow
Set-Location $frontendDir

npm install
npm run build

if ($LASTEXITCODE -ne 0) {
Write-Host "[ERROR] Frontend build failed." -ForegroundColor Red
Pause
exit 1
}

# ---------- CLEAN OLD FRONTEND ----------

Write-Host "[STEP] Cleaning old frontend..." -ForegroundColor Yellow
$frontendTarget = Join-Path $installDir "react-frontend\build"
Remove-Item $frontendTarget -Recurse -Force -ErrorAction SilentlyContinue

# ---------- COPY FRONTEND ----------

Write-Host "[STEP] Updating frontend..." -ForegroundColor Yellow
Copy-Item (Join-Path $frontendDir "build") $frontendTarget -Recurse -Force

# ---------- UPDATE BACKEND ----------

Write-Host "[STEP] Updating backend..." -ForegroundColor Yellow
robocopy $backendDir (Join-Path $installDir "app") /MIR /XD **pycache** .git venv | Out-Null

if ($LASTEXITCODE -ge 8) {
Write-Host "[ERROR] Backend copy failed." -ForegroundColor Red
Pause
exit 1
}

# ---------- COPY BACKUP MODULE ----------

Write-Host "[STEP] Copying backup module..." -ForegroundColor Yellow

$backupSource = Join-Path $projectDir "backup"
$backupTarget = Join-Path $installDir "backup"

if (Test-Path $backupSource) {
robocopy $backupSource $backupTarget /MIR | Out-Null

```
if ($LASTEXITCODE -ge 8) {
    Write-Host "[ERROR] Backup module copy failed." -ForegroundColor Red
    Pause
    exit 1
}

Write-Host "[OK] Backup module updated." -ForegroundColor Green
```

}
else {
Write-Host "[WARNING] Backup folder not found." -ForegroundColor DarkYellow
}

# ---------- COPY START SCRIPT ----------

Write-Host "[STEP] Updating start script..." -ForegroundColor Yellow
Copy-Item (Join-Path $projectDir "start.py") (Join-Path $installDir "start.py") -Force

# ---------- COPY .env ----------

Write-Host "[STEP] Updating environment file..." -ForegroundColor Yellow

$envSource = Join-Path $projectDir ".env"
$envTarget = Join-Path $installDir ".env"

if (Test-Path $envSource) {
Copy-Item $envSource $envTarget -Force
Write-Host "[OK] .env updated." -ForegroundColor Green
}
else {
Write-Host "[WARNING] .env not found." -ForegroundColor DarkYellow
}

# ---------- ENSURE ALEMBIC ----------

Write-Host "[STEP] Ensuring Alembic is installed..." -ForegroundColor Yellow
python -m pip install --upgrade alembic | Out-Null

# ---------- RUN MIGRATIONS ----------

Write-Host "[STEP] Running DB migrations..." -ForegroundColor Yellow

Set-Location $installDir
python -m alembic upgrade head

if ($LASTEXITCODE -ne 0) {
Write-Host "[WARNING] Migration failed." -ForegroundColor DarkYellow
}

# ---------- START BACKEND ----------

Write-Host "[STEP] Starting backend..." -ForegroundColor Green
Start-Process python (Join-Path $installDir "start.py")

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "   UPDATE COMPLETED SUCCESSFULLY" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

Pause

# ============================================

# NOTES:

# - backup\ must contain **init**.py

# - .env is always overwritten

# - stable deployment flow

# ============================================
