@echo off
echo Installing frontend dependencies...
call npm i
if %errorlevel% neq 0 (
    echo Error when installing frontend dependencies
    pause
    exit /b
)

echo Launching the frontend in a new window...
start "Frontend" cmd /c "npm start & pause"

echo Going to the BackEnd folder...
cd ./BackEnd
if %errorlevel% neq 0 (
    echo Error: The BackEnd folder was not found!
    pause
    exit /b
)

echo Installing backend dependencies...
call npm i
if %errorlevel% neq 0 (
    echo Error when installing backend dependencies
    pause
    exit /b
)

echo Launching the backend in a new window...
start "Backend" cmd /c "npx nodemon ./index.js & pause"

echo Both servers must be running!
pause