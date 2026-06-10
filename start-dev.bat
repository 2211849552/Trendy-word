@echo off
title Trendy Word - Frontend Dev
cd /d "%~dp0"
echo.
echo  Trendy Word - React Frontend
echo  ===========================
echo.
echo  قبل التشغيل تأكد من:
echo    1. MySQL شغال (XAMPP)
echo    2. Laravel Backend يعمل على المنفذ 8000:
echo       cd path\to\TRENDY_Backend
echo       php artisan serve
echo.
echo  الواجهة ستفتح على: http://localhost:5173
echo  API عبر proxy: http://127.0.0.1:8000
echo.
npm run dev
pause
