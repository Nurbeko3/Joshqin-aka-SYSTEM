@echo off
setlocal

:: Define the target directory (Startup folder)
set "STARTUP_DIR=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "TARGET_FILE=%STARTUP_DIR%\EduDocsServer.bat"
set "PROJECT_DIR=%~dp0"

:: Remove trailing backslash from PROJECT_DIR if it exists
if "%PROJECT_DIR:~-1%"=="\" set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"

:: Create the startup batch file
echo @echo off > "%TARGET_FILE%"
echo title EduDocs Server >> "%TARGET_FILE%"
echo :: Wait for network to be ready >> "%TARGET_FILE%"
echo timeout /t 10 /nobreak ^>nul >> "%TARGET_FILE%"
echo cd /d "%PROJECT_DIR%" >> "%TARGET_FILE%"
echo node server.js >> "%TARGET_FILE%"

if exist "%TARGET_FILE%" (
    echo [SUCCESS] File created at %TARGET_FILE%
) else (
    echo [ERROR] Failed to create file
)
