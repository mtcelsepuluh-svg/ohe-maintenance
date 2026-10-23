@echo off
echo ========================================
echo  OHE Maintenance - Production Mode
echo ========================================
echo.

echo Starting MongoDB (if not already running)...
net start MongoDB >nul 2>&1

echo Starting Backend Server...
cd backend
start "OHE Backend" cmd /k "npm start"
cd ..

timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
cd frontend
start "OHE Frontend" cmd /k "npm run preview"
cd ..

echo.
echo ========================================
echo  Application Started!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:4173
echo.
echo Press any key to exit this window...
pause >nul
