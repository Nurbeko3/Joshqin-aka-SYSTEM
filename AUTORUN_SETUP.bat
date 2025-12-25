@echo off
setlocal

:: Define the target directory (Startup folder)
set "STARTUP_DIR=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "TARGET_FILE=%STARTUP_DIR%\EduDocsServer.bat"
set "PROJECT_DIR=%~dp0"

:: Remove trailing backslash from PROJECT_DIR if it exists
if "%PROJECT_DIR:~-1%"=="\" set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"

echo.
echo ===================================================
echo     EduDocs Avtomatik Ishga Tushish Sozlamasi
echo ===================================================
echo.
echo Loyiha papkasi: %PROJECT_DIR%
echo Startup papkasi: %STARTUP_DIR%
echo.

:: Create the startup batch file
echo @echo off > "%TARGET_FILE%"
echo title EduDocs Server >> "%TARGET_FILE%"
echo :: Wait for network to be ready >> "%TARGET_FILE%"
echo timeout /t 10 /nobreak ^>nul >> "%TARGET_FILE%"
echo cd /d "%PROJECT_DIR%" >> "%TARGET_FILE%"
echo node server.js >> "%TARGET_FILE%"

if exist "%TARGET_FILE%" (
    echo [MUVAFFAQIYATLI] Startup fayli yaratildi!
    echo Fayl manzili: %TARGET_FILE%
    echo.
    echo Endi kompyuter yonganda server avtomatik ishga tushadi (port 3001).
) else (
    echo [XATOLIK] Startup faylini yaratib bo'lmadi.
    echo Iltimos, ushbu faylni Administrator sifatida ishga tushirib ko'ring.
)

echo.
echo Tugatish uchun istalgan tugmani bosing...
pause
