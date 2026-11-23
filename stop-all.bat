@echo off
title Neelam Ki Gharelu Rasoi - Stop All Servers
color 0C
echo Stopping all running servers for Neelam Ki Gharelu Rasoi...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5174') do taskkill /F /PID %%a >nul 2>&1
echo Done! All servers stopped.
pause
