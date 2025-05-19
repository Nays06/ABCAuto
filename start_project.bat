@echo off
echo Launching the frontend in a new window...
start "Frontend" cmd /c "npm start & pause"

echo Going to the BackEnd folder...
cd ./BackEnd
if %errorlevel% neq 0 (
    echo Error: The BackEnd folder was not found!
    pause
    exit /b
)

echo Launching the backend in a new window...
start "Backend" cmd /c "npx nodemon ./index.js & pause"

echo Both servers must be running!
pause