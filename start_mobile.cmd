@echo off
title ARQITEKT Mobile
echo ============================================
echo   ARQITEKT Mobile - Flutter
echo ============================================
echo.

cd /d %~dp0mobile

echo Checking connected devices...
flutter devices
echo.

echo Starting app on connected device...
echo (Make sure USB debugging is enabled on your Android phone)
echo.

flutter run

pause
