@echo off
title Trendy Word - API Server (PHP)
cd /d "%~dp0"
echo.
echo  Trendy Word - PHP API Server
echo  ============================
echo  Address: http://localhost:8000
echo  API    : http://localhost:8000/api/v1
echo.
echo  Press Ctrl+C to stop
echo.
php -S localhost:8000 api/router.php
pause
