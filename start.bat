@echo off
REM Script para arrancar el proyecto Iceland Tourism Geoportal en Windows

echo.
echo ========================================
echo Iceland Tourism Geoportal - Iniciando
echo ========================================
echo.

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js no está instalado o no está en el PATH
    echo Por favor, instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar si npm está instalado
npm --version >nul 2>&1
if errorlevel 1 (
    echo Error: npm no está disponible
    pause
    exit /b 1
)

echo Iniciando servidor en puerto 3000...
echo Abre tu navegador en: http://localhost:3000
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

npm start

pause
