@echo off
title Smart Credit Insight Engine - Demo Mode
echo ===========================================
echo      Starting Smart Credit Insight Engine
echo ===========================================
echo.

REM ---- START BACKEND ----
echo Starting backend server...
start cmd /k "cd backend && venv\Scripts\activate && uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
timeout /t 3 >nul

REM ---- START FRONTEND ----
echo Starting frontend server...
start cmd /k "cd frontend && npm run dev"
timeout /t 5 >nul

REM ---- OPEN BROWSER ----
echo Opening browser...
start http://localhost:5173

echo.
echo Demo started successfully!
echo Close this window if needed.
pause
