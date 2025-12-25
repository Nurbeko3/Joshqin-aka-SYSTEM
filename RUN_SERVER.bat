@echo off
setlocal EnableDelayedExpansion
title EduDocs Server

:: Get Local IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr "IPv4"') do (
    set "IP=%%a"
    set "IP=!IP: =!"
)

if "%IP%"=="" set IP=localhost

echo.
echo ===================================================
echo     EduDocs Server
echo ===================================================
echo.
echo Server IP bo'yicha ishlamoqda:
echo.
echo     http://%IP%:3001
echo.
echo Brauzerda shu manzilni kiritib kiring.
echo.
echo ===================================================
echo.
node server.js
pause
