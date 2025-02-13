@echo off
setlocal EnableDelayedExpansion

REM Read current version
set /p VERSION=<VERSION
echo Current version: v%VERSION%

echo Building Crypto Ticker v%VERSION% for all platforms...

REM Create builds directory if it doesn't exist
if not exist "builds" mkdir builds

REM Windows AMD64
echo Building for Windows AMD64...
set GOOS=windows
set GOARCH=amd64
go build -o builds/crypticker_windows_amd64_v%VERSION%.exe

REM Windows ARM64
echo Building for Windows ARM64...
set GOOS=windows
set GOARCH=arm64
go build -o builds/crypticker_windows_arm64_v%VERSION%.exe

REM macOS AMD64
echo Building for macOS AMD64...
set GOOS=darwin
set GOARCH=amd64
go build -o builds/crypticker_darwin_amd64_v%VERSION%

REM macOS ARM64 (M1/M2)
echo Building for macOS ARM64...
set GOOS=darwin
set GOARCH=arm64
go build -o builds/crypticker_darwin_arm64_v%VERSION%

REM Linux AMD64
echo Building for Linux AMD64...
set GOOS=linux
set GOARCH=amd64
go build -o builds/crypticker_linux_amd64_v%VERSION%

REM Linux ARM64
echo Building for Linux ARM64...
set GOOS=linux
set GOARCH=arm64
go build -o builds/crypticker_linux_arm64_v%VERSION%

echo Build complete! Binaries are in the builds directory.
echo.
echo Generated binaries:
dir /b builds\crypticker_*_v%VERSION%*

REM Increment version for next build
set /a NEXT_VERSION=%VERSION%+1
echo %NEXT_VERSION%>VERSION
echo.
echo Version incremented to v%NEXT_VERSION% for next build
pause 