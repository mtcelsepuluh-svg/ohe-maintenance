@echo off
echo ========================================
echo Starting OHE Maintenance Application
echo ========================================
echo.

echo Starting Backend Server...
cd backend
start "OHE Backend" cmd /k "npm run dev"
cd ..

timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
cd frontend
start "OHE Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ========================================
echo Application Started!
echo ========================================
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Default Login:
echo User ID: ADMIN001
echo PIN:     admin123
echo ========================================
echo.
pause
