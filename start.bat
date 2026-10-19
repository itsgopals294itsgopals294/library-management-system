@echo off
title Athena LMS Server & Client
echo =======================================================
echo   ATHENA LIBRARY MANAGEMENT SYSTEM (MERN STACK)
echo =======================================================

:: Free ports 5000 and 5173 if previously held
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000 " ^| findstr "LISTENING"') do (
  echo Freeing port 5000 (PID %%a)...
  taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173 " ^| findstr "LISTENING"') do (
  echo Freeing port 5173 (PID %%a)...
  taskkill /F /PID %%a >nul 2>&1
)

echo.
echo   Frontend : http://localhost:5173
echo   Backend  : http://localhost:5000/api
echo =======================================================
echo Starting Athena LMS services...
echo.

npm run dev
pause
