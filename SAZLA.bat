@echo off
setlocal EnableDelayedExpansion

echo.
echo ===================================================
echo     EduDocs Tizimi - Hosts Faylini Tuzatish
echo ===================================================
echo.

:: Check for Administrator privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [XATOLIK] Administrator huquqi kerak!
    echo Iltimos, fayl ustiga o'ng tugmani bosib,
    echo "Administrator sifatida ishga tushirish"ni tanlang.
    echo.
    pause
    exit
)

:: Get Local IP Address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr "IPv4"') do (
    set "IP=%%a"
    set "IP=!IP: =!"
)

if "%IP%"=="" (
    echo [XATOLIK] IP manzil aniqlanmadi. Internetga ulanganingizni tekshiring.
    pause
    exit
)

echo Sizning IP manzilingiz: %IP%
echo.

:: Define Hosts path
set "HOSTS=C:\Windows\System32\drivers\etc\hosts"

:: Backup hosts file
copy /y "%HOSTS%" "%HOSTS%.bak" >nul
echo [INFO] Hosts fayli nusxalandi (.bak)

:: Remove old entries for edu.docs.uz
findstr /v "edu.docs.uz" "%HOSTS%.bak" > "%HOSTS%"

:: Add new entry
echo %IP%  www.edu.docs.uz >> "%HOSTS%"
echo %IP%  edu.docs.uz >> "%HOSTS%"

echo [OK] Hosts fayli yangilandi:
echo      %IP% -^> www.edu.docs.uz
echo.

:: Flush DNS
ipconfig /flushdns >nul
echo [OK] DNS kesh tozalandi.

echo.
echo ===================================================
echo TAYYOR! Endi quyidagi ishni qiling:
echo 1. RUN_SERVER.bat faylini ishga tushiring.
echo 2. Brauzerni ochib http://www.edu.docs.uz ga kiring.
echo ===================================================
echo.
pause
