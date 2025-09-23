@echo off
echo Starting Data Augmentation Engine...

echo.
echo Starting Backend Server...
start "Backend" cmd /k "cd /d backend && python run.py"

timeout /t 5 /nobreak > nul

echo.
echo Starting Frontend Server...
start "Frontend" cmd /k "cd /d frontend && npm start"

echo.
echo Servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause > nul