@echo off
echo ========================================
echo  OHE Maintenance - Production Deployment
echo ========================================
echo.

echo [1/5] Installing backend dependencies...
cd backend
call npm install --production
cd ..

echo.
echo [2/5] Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo.
echo [3/5] Building frontend for production...
cd frontend
call npm run build
cd ..

echo.
echo [4/5] Starting MongoDB...
net start MongoDB >nul 2>&1
if %errorlevel% neq 0 (
    echo Warning: MongoDB may already be running or failed to start
)

echo.
echo [5/5] Starting production servers...
echo.
echo Starting Backend Server (Port 5000)...
cd backend
start "OHE Backend" cmd /k "npm start"
cd ..

timeout /t 3 /nobreak >nul

echo Starting Frontend Server (Port 4173)...
cd frontend
start "OHE Frontend" cmd /k "npm run preview"
cd ..

echo.
echo ========================================
echo  Deployment Complete!
echo ========================================
echo.
echo Backend API:  http://localhost:5000
echo Frontend App: http://localhost:4173
echo.
echo Default Login:
echo   User ID: ADMIN001
echo   PIN: admin123
echo.
echo Press any key to exit this window...
pause >nul
