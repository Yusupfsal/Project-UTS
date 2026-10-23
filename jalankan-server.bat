@echo off
title AzrilWifi Local Server (Port 8080)
echo ===================================================
echo   Menjalankan Web Server Lokal AzrilWifi
echo ===================================================
echo Server aktif di: http://localhost:8080
echo Tekan tombol Ctrl + C di jendela ini jika ingin stop.
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
