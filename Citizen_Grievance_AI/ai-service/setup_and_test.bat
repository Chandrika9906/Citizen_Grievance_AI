@echo off
echo ========================================
echo   AI SERVICE - SETUP AND TEST
echo ========================================
echo.

echo [1/4] Installing dependencies...
pip install flask flask-cors scikit-learn pandas numpy joblib nltk textblob geopy pillow --quiet
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed
echo.

echo [2/4] Downloading NLTK data...
python -c "import nltk; nltk.download('punkt', quiet=True); nltk.download('brown', quiet=True)"
if %errorlevel% neq 0 (
    echo ERROR: Failed to download NLTK data
    pause
    exit /b 1
)
echo ✅ NLTK data downloaded
echo.

echo [3/4] Testing AI features...
python tests\test_all.py
if %errorlevel% neq 0 (
    echo ERROR: Tests failed
    pause
    exit /b 1
)
echo.

echo [4/4] All tests passed! ✅
echo.
echo ========================================
echo   READY TO START AI SERVICE
echo ========================================
echo.
echo To start the AI service, run:
echo   python app.py
echo.
echo Then test the API with:
echo   python tests\test_api.py
echo.
pause
