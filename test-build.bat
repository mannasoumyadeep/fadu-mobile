@echo off
echo Testing production build of Fadu Card Game
echo.

:: Check if serve is installed
npx serve -v >nul 2>&1
if %errorlevel% neq 0 (
  echo Installing serve package...
  npm install -g serve
)

:: Serve the build folder
echo Starting local server for testing...
echo.
echo Application will be available at http://localhost:5000
echo Press Ctrl+C to stop the server when done testing
echo.
serve -s build
