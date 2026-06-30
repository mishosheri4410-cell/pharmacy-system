@echo off
cd /d "C:\Users\admin\OneDrive\Documents\OneDrive\Desktop\opencode\server"
echo Starting Pharmacy Management Server...
echo.
echo Opening browser...
start "" "http://localhost:3000"
node server.js
pause
