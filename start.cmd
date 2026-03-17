@echo off
:: ============================================================================
:: ARQITEKT — Workspace Launcher
:: ============================================================================
:: Doppelklick startet Dashboard im Hintergrund + oeffnet Browser
:: VS Code wird ueber das Dashboard geoeffnet
:: ============================================================================

cd /d "%~dp0_ARQITEKT"

:: Start Dashboard Server im Hintergrund (kein sichtbares Terminal)
start "" /B /MIN node scripts/server.mjs >nul 2>&1

:: Warten bis Server bereit
timeout /t 2 /nobreak >nul

:: Dashboard im Browser oeffnen
start "" "http://localhost:3333"
