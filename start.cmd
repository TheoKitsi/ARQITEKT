@echo off
title ARQITEKT Hub
echo ============================================
echo   ARQITEKT Hub - Starting...
echo ============================================
echo.

:: Install dependencies if needed
if not exist "%~dp0_ARQITEKT\server\node_modules" (
  echo [0/2] Installing backend dependencies...
  cd /d "%~dp0_ARQITEKT\server" && npm install
)
if not exist "%~dp0_ARQITEKT\hub\node_modules" (
  echo [0/2] Installing frontend dependencies...
  cd /d "%~dp0_ARQITEKT\hub" && npm install
)

:: Start backend server in background
echo [1/2] Starting Express backend on port 3334...
start "ARQITEKT Backend" /min cmd /c "cd /d %~dp0_ARQITEKT\server && npm run dev"

:: Wait for backend
timeout /t 3 /nobreak >nul

:: Start frontend
echo [2/2] Starting Vite frontend on port 5173...
start "ARQITEKT Frontend" /min cmd /c "cd /d %~dp0_ARQITEKT\hub && npm run dev"

:: Wait for frontend
timeout /t 3 /nobreak >nul

:: Open browser
echo.
echo Opening http://localhost:5173 ...
start http://localhost:5173

echo.
echo ============================================
echo   ARQITEKT Hub is running!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:3334
echo.
echo   Close this window to stop all servers.
echo ============================================
echo.
pause
:: Kill background processes when user closes
taskkill /fi "WINDOWTITLE eq ARQITEKT Backend" /f >nul 2>&1
taskkill /fi "WINDOWTITLE eq ARQITEKT Frontend" /f >nul 2>&1
