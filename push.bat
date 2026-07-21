@echo off
setlocal
cd /d "%~dp0"

call npm run deploy:pages
if errorlevel 1 exit /b 1

echo all done!
