@echo off
echo Starting DDDB Platform...

echo.
echo Starting Backend Server...
start "Backend" cmd /k "cd /d C:\Users\deoklyongmoon\Desktop\DDDB\Data_Augmentation\backend && python run.py"

timeout /t 3 /nobreak > nul

echo.
echo Starting Frontend Server...
start "Frontend" cmd /k "cd /d C:\Users\deoklyongmoon\Desktop\DDDB\Data_Augmentation\frontend && npm start"

echo.
echo DDDB Platform is starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8000/docs
echo.
echo Press any key to exit...
pause > nul