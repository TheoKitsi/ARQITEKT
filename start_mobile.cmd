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

echo Choose target:
echo   [1] Chrome (Web Preview)
echo   [2] Windows (Desktop)
echo   [3] Connected mobile device (USB)
echo.
set /p choice="Enter choice (1/2/3): "

if "%choice%"=="1" (
  echo Starting on Chrome...
  flutter run -d chrome
) else if "%choice%"=="2" (
  echo Starting on Windows Desktop...
  flutter run -d windows
) else if "%choice%"=="3" (
  echo Starting on connected device...
  echo Make sure USB debugging is enabled on your Android phone.
  flutter run
) else (
  echo Invalid choice. Defaulting to Chrome...
  flutter run -d chrome
)

pause
