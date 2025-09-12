@echo off
echo Starting Job Finder Platform in Development Mode...
echo.

echo Installing dependencies...
echo.

echo Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Failed to install backend dependencies
    pause
    exit /b 1
)

echo Installing frontend dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo Failed to install frontend dependencies
    pause
    exit /b 1
)

cd ..

echo.
echo Dependencies installed successfully!
echo.
echo Starting services...
echo Backend will run on: http://localhost:3030
echo Frontend will run on: http://localhost:3000
echo.

echo Starting backend and frontend...
start "Backend Server" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak > nul
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo Both services are starting...
echo Check the opened terminal windows for status
echo.
pause
