@echo off
echo Starting Deer River Development Server...
cd /d "%~dp0"
npx next dev --port 3000
pause
