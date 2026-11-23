@echo off
title Neelam Ki Gharelu Rasoi - Launcher
color 0A
echo ========================================================
echo   NEELAM KI GHARELU RASOI - FULL-STACK PLATFORM LAUNCHER
echo   Moradabad, Uttar Pradesh (Helpline: 9997433379)
echo ========================================================
echo.

echo [1/3] Starting Backend API Server (Port 5000)...
start "Neelam Rasoi - Backend Server [Port 5000]" cmd /k "cd /d "%~dp0backend" && npm start"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Customer Ordering App (Port 5173)...
start "Neelam Rasoi - Customer App [Port 5173]" cmd /k "cd /d "%~dp0customer-app" && npm run dev"

timeout /t 2 /nobreak >nul

echo [3/3] Starting Admin Management Dashboard (Port 5174)...
start "Neelam Rasoi - Admin App [Port 5174]" cmd /k "cd /d "%~dp0admin-app" && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo ========================================================
echo   ALL 3 APPLICATIONS ARE NOW RUNNING!
echo.
echo   Customer App:      http://localhost:5173
echo   Admin Dashboard:   http://localhost:5174
echo   Backend API:       http://localhost:5000/api/health
echo.
echo   Admin Login:       admin@neelamrasoi.com
echo   Admin Password:    Admin@Neelam2026
echo ========================================================
echo.
echo Opening applications in your web browser...
start http://localhost:5173
start http://localhost:5174
echo.
echo (Keep the three command prompt windows open while using the app.)
pause
