@echo off
setlocal

echo =========================================
echo   Phone Shop App - Builder ^& Updater
echo =========================================

:: Check for admin rights
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Please run this file as Administrator.
    pause
    exit /b 1
)

:: Get current script directory (builder folder)
set SCRIPT_DIR=%~dp0
set POWERSHELL_EXE=%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe

:: Run PowerShell builder
"%POWERSHELL_EXE%" -ExecutionPolicy Bypass -NoProfile -File "%SCRIPT_DIR%build_update.ps1"

pause
