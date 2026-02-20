@echo off
setlocal EnableDelayedExpansion

:: ============================================
:: PhoneShopApp Professional Updater (FIXED)
:: ============================================

:: --- REQUIRE ADMIN ---
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Requesting administrator privileges...
    powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

:: --- CONFIG ---
set PROJECT_DIR=C:\Users\KLOUNGE\Documents\PHONE_SHOP
set FRONTEND_DIR=%PROJECT_DIR%\react-frontend
set BACKEND_DIR=%PROJECT_DIR%\app
set INSTALL_DIR=C:\Program Files\PhoneShopApp
set ROBOCOPY_EXE=%SystemRoot%\System32\Robocopy.exe

echo =====================================
echo   PhoneShopApp Updating...
echo =====================================

:: --- STOP BACKEND ---
echo Stopping running backend...
taskkill /F /IM python.exe >nul 2>&1
taskkill /F /IM uvicorn.exe >nul 2>&1

:: --- BUILD FRONTEND ---
echo Building frontend...
cd /d "%FRONTEND_DIR%"
call npm install
call npm run build
if errorlevel 1 (
    echo [ERROR] Frontend build failed.
    pause
    exit /b 1
)

:: --- CLEAN OLD FRONTEND (CRITICAL FIX) ---
echo Cleaning old frontend...
rmdir /S /Q "%INSTALL_DIR%\react-frontend\build" 2>nul

:: --- COPY NEW FRONTEND ---
echo Updating frontend...
"%ROBOCOPY_EXE%" "%FRONTEND_DIR%\build" "%INSTALL_DIR%\react-frontend\build" /MIR /R:2 /W:2
if %errorlevel% GEQ 8 (
    echo [ERROR] Frontend copy failed.
    pause
    exit /b 1
)

:: --- UPDATE BACKEND (USE FULL ROBOCOPY PATH) ---
echo Updating backend...
"%ROBOCOPY_EXE%" "%BACKEND_DIR%" "%INSTALL_DIR%\app" /MIR /XD __pycache__ .git venv
if %errorlevel% GEQ 8 (
    echo [ERROR] Backend copy failed.
    pause
    exit /b 1
)

copy /Y "%PROJECT_DIR%\start.py" "%INSTALL_DIR%\start.py" >nul

:: --- COPY .env SAFELY ---
echo Checking .env file...
if exist "%PROJECT_DIR%\.env" (
    if not exist "%INSTALL_DIR%\.env" (
        copy /Y "%PROJECT_DIR%\.env" "%INSTALL_DIR%\.env" >nul
        echo [OK] .env copied.
    ) else (
        echo [INFO] .env exists. Skipped.
    )
)

:: --- INSTALL ALEMBIC IF MISSING ---
echo Ensuring Alembic is installed...
python -m pip install --upgrade alembic >nul 2>&1

:: --- RUN MIGRATIONS ---
echo Running database migration...
cd /d "%INSTALL_DIR%"
python -m alembic upgrade head
if errorlevel 1 (
    echo [WARN] Migration failed. Check Python environment.
)

:: --- START BACKEND ---
echo Starting backend...
start "" python "%INSTALL_DIR%\start.py"

echo.
echo =====================================
echo   UPDATE COMPLETED SUCCESSFULLY
echo =====================================
pause
