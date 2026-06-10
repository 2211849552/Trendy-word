@echo off
title Trendy Word - API Warning
cd /d "%~dp0"
echo.
echo  ============================================
echo   تحذير: لا تستخدم هذا الملف للتطوير
echo  ============================================
echo.
echo  المشروع يعتمد على Laravel Backend (TRENDY_Backend)
echo  وليس على PHP API المحلي في مجلد api/
echo.
echo  شغّل الخادم الحقيقي:
echo    cd path\to\TRENDY_Backend
echo    php artisan serve
echo.
echo  ثم شغّل الواجهة:
echo    start-dev.bat
echo.
pause
