@echo off
REM Lambda Calculus Interpreter Launcher
REM This script launches the lambda calculus interpreter using Python

REM Check if Python is available
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    where python3 >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo Error: Python is not installed or not in PATH
        echo Please install Python from https://www.python.org/downloads/
        pause
        exit /b 1
    ) else (
        set PYTHON=python3
    )
) else (
    set PYTHON=python
)

REM Get the directory where this batch file is located
set SCRIPT_DIR=%~dp0

REM Check if lambda_calculus.py exists in the same directory
if not exist "%SCRIPT_DIR%lambda_calculus.py" (
    echo Error: lambda_calculus.py not found in %SCRIPT_DIR%
    echo Please ensure lambda_calculus.py is in the same folder as this batch file.
    pause
    exit /b 1
)

REM Launch the interpreter
echo Starting Lambda Calculus Interpreter...
echo.
%PYTHON% "%SCRIPT_DIR%lambda_calculus.py" %*

REM Keep window open if there was an error
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Interpreter exited with error code %ERRORLEVEL%
    pause
)
