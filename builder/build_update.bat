@echo off
setlocal EnableDelayedExpansion

:: ============================================
:: PhoneShopApp Professional Updater (STABLE)
:: ============================================

:: ---------- REQUIRE ADMIN ----------
net session >nul 2>&1
if %errorLevel% neq 0 (
echo Requesting administrator privileges...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
"Start-Process '%~f0' -Verb RunAs"
exit /b
)

:: ---------- CONFIG ----------
set PROJECT_DIR=C:\Users\KLOUNGE\Documents\PHONE_SHOP
set FRONTEND_DIR=%PROJECT_DIR%\react-frontend
set BACKEND_DIR=%PROJECT_DIR%\app
set INSTALL_DIR=C:\Program Files\PhoneShopApp
set POWERSHELL_EXE=C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe

echo.
echo =====================================
echo   PhoneShopApp Updating...
echo =====================================
echo.

:: ---------- STOP BACKEND ----------
echo [STEP] Stopping running backend...
taskkill /F /IM python.exe >nul 2>&1
taskkill /F /IM uvicorn.exe >nul 2>&1

:: ---------- BUILD FRONTEND (SAFE) ----------
echo [STEP] Building frontend via PowerShell...
"%POWERSHELL_EXE%" -ExecutionPolicy Bypass -NoProfile -Command ^
"cd '%FRONTEND_DIR%'; npm install; npm run build"

if errorlevel 1 (
echo [ERROR] Frontend build failed.
pause
exit /b 1
)

:: ---------- CLEAN OLD FRONTEND ----------
echo [STEP] Cleaning old frontend...
rmdir /S /Q "%INSTALL_DIR%\react-frontend\build" 2>nul

:: ---------- COPY FRONTEND ----------
echo [STEP] Updating frontend...
xcopy /E /I /Y "%FRONTEND_DIR%\build" "%INSTALL_DIR%\react-frontend\build"

if errorlevel 1 (
echo [ERROR] Frontend copy failed.
pause
exit /b 1
)

:: ---------- UPDATE BACKEND ----------
echo [STEP] Updating backend...
xcopy /E /I /Y "%BACKEND_DIR%" "%INSTALL_DIR%\app"

if errorlevel 1 (
echo [ERROR] Backend copy failed.
pause
exit /b 1
)

:: ---------- COPY BACKUP MODULE ----------
echo [STEP] Copying backup module...
if exist "%PROJECT_DIR%\backup" (
xcopy /E /I /Y "%PROJECT_DIR%\backup" "%INSTALL_DIR%\backup"
echo [OK] Backup module copied.
) else (
echo [WARNING] Backup folder not found.
)

:: ---------- COPY START FILE ----------
echo [STEP] Updating start script...
xcopy /Y "%PROJECT_DIR%\start.py" "%INSTALL_DIR%\start.py"

:: ---------- COPY .env ----------
echo [STEP] Updating environment file...
if exist "%PROJECT_DIR%.env" (
xcopy /Y "%PROJECT_DIR%.env" "%INSTALL_DIR%.env"
echo [OK] .env updated.
) else (
echo [WARNING] .env not found in project.
)

:: ---------- ENSURE ALEMBIC ----------
echo [STEP] Ensuring Alembic is installed...
python -m pip install --upgrade alembic >nul 2>&1

:: ---------- RUN MIGRATIONS ----------
echo [STEP] Running database migration...
cd /d "%INSTALL_DIR%"
python -m alembic upgrade head

if errorlevel 1 (
echo [WARNING] Migration failed. Check environment.
)

:: ---------- START BACKEND ----------
echo [STEP] Starting backend...
start "" python "%INSTALL_DIR%\start.py"

echo.
echo =====================================
echo   UPDATE COMPLETED SUCCESSFULLY
echo =====================================
echo.

pause

:: ============================================
:: NOTES:
:: - backup\ must contain **init**.py
:: - .env is always overwritten
:: - Uses PowerShell for safe frontend build
:: - Uses xcopy for stable file copying
:: ============================================
