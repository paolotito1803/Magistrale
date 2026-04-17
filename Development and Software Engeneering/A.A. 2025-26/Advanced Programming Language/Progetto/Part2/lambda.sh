#!/bin/bash
# Lambda Calculus Interpreter Launcher
# This script launches the lambda calculus interpreter using Python

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Find Python
PYTHON=""
if command -v python3 &> /dev/null; then
    PYTHON="python3"
elif command -v python &> /dev/null; then
    PYTHON="python"
fi

if [ -z "$PYTHON" ]; then
    echo "Error: Python is not installed or not in PATH"
    echo "Please install Python from https://www.python.org/downloads/"
    exit 1
fi

# Check if lambda_calculus.py exists in the same directory
if [ ! -f "$SCRIPT_DIR/lambda_calculus.py" ]; then
    echo "Error: lambda_calculus.py not found in $SCRIPT_DIR"
    echo "Please ensure lambda_calculus.py is in the same folder as this script."
    exit 1
fi

# Launch the interpreter
exec "$PYTHON" "$SCRIPT_DIR/lambda_calculus.py" "$@"
