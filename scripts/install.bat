@echo off
REM React Feature Discovery - Windows Installation Script

echo Installing React Feature Discovery...

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

echo Node.js detected: 
node -v

REM Install dependencies
echo Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install dependencies
    exit /b 1
)

REM Build the project
echo Building project...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo Error: Build failed
    exit /b 1
)

REM Check if build was successful
if not exist "dist\cli.js" (
    echo Error: Build failed. dist\cli.js not found.
    exit /b 1
)

echo Build successful!

REM Ask if user wants to link globally
set /p LINK="Do you want to link this tool globally? (y/n): "
if /i "%LINK%"=="y" (
    echo Linking globally...
    call npm link
    echo Tool linked! You can now use 'rfd' command anywhere.
) else (
    echo Tool installed locally. Run with: node %CD%\dist\cli.js
)

echo.
echo Installation complete!
echo.
echo Usage:
echo   rfd --help                    # Show help
echo   rfd --root ./src              # Analyze a directory
echo   rfd --format markdown,json    # Generate multiple formats
echo.
echo For more information, see README.md

pause
