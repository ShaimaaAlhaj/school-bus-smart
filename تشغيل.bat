@echo off
echo.
echo ============================================
echo   باص المدرسة الذكي - تشغيل الخادم
echo ============================================
echo.
echo 1. تثبيت المكتبات...
call npm install
echo.
echo 2. تشغيل الخادم...
echo    افتح المتصفح على: http://localhost:5000
echo.
node server.js
pause
