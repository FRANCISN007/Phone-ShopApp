@echo off
setlocal

:: =====================================================
::  PhoneShop App Updater (CLEAN + STABLE)
:: =====================================================

:: === CONFIG ===
set PROJECT_DIR=C:\Users\KLOUNGE\Documents\PHONE_SHOP
set FRONTEND_PROJECT=%PROJECT_DIR%\react-frontend
set BACKEND_PROJECT=%PROJECT_DIR%\app
set INSTALL_DIR=C:\Program Files\PhoneShopApp
set POWERSHELL_EXE=C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe

echo ==========================================
echo    PhoneShop App Updater Starting...
echo ==========================================

:: === STEP 1: Build React (Safe via PowerShell) ===
echo [STEP 1] Building React frontend...
"%POWERSHELL_EXE%" -ExecutionPolicy Bypass -NoProfile -Command ^
"cd '%FRONTEND_PROJECT%'; npm install; npm run build"

if errorlevel 1 (
echo [ERROR] Frontend build failed. Aborting update.
pause
exit /b 1
)

:: === STEP 2: Remove old frontend ===
if exist "%INSTALL_DIR%\react-frontend\build" (
echo [STEP 2] Removing old frontend build...
rmdir /s /q "%INSTALL_DIR%\react-frontend\build"
)

:: === STEP 3: Copy new frontend ===
echo [STEP 3] Copying new frontend build...
xcopy /E /I /Y "%FRONTEND_PROJECT%\build" "%INSTALL_DIR%\react-frontend\build"

if errorlevel 1 (
echo [ERROR] Frontend copy failed!
pause
exit /b 1
)

:: === STEP 4: Update backend ===
echo [STEP 4] Updating backend files...
xcopy /E /I /Y "%BACKEND_PROJECT%" "%INSTALL_DIR%\app"

if errorlevel 1 (
echo [ERROR] Backend update failed!
pause
exit /b 1
)

:: === STEP 5: Copy backup module (FIX) ===
echo [STEP 5] Copying backup module...
if exist "%PROJECT_DIR%\backup" (
xcopy /E /I /Y "%PROJECT_DIR%\backup" "%INSTALL_DIR%\backup"
echo [OK] Backup module copied.
) else (
echo [WARN] Backup folder not found. Skipping...
)

:: === STEP 6: Copy start.py ===
echo [STEP 6] Updating start script...
xcopy /Y "%PROJECT_DIR%\start.py" "%INSTALL_DIR%\start.py"

:: === STEP 7: Copy .env ===
echo [STEP 7] Copying .env file...
if exist "%PROJECT_DIR%.env" (
xcopy /Y "%PROJECT_DIR%.env" "%INSTALL_DIR%.env"
echo [OK] .env updated.
) else (
echo [WARN] .env file not found. Skipping...
)

:: === STEP 8: Run migrations ===
echo [STEP 8] Running database migrations...
cd /d "%INSTALL_DIR%"
python -m alembic upgrade head

:: === STEP 9: Restart backend ===
echo [STEP 9] Restarting backend...
taskkill /F /IM python.exe >nul 2>&1
taskkill /F /IM uvicorn.exe >nul 2>&1

start "" python "%INSTALL_DIR%\start.py"

echo.
echo ==========================================
echo    UPDATE COMPLETED SUCCESSFULLY
echo ==========================================
echo.

pause
:: =====================================================
:: NOTES:
:: - Ensure backup\ has **init**.py
:: - .env is always overwritten
:: - Simple + reliable deployment flow
:: =====================================================
