#!/bin/bash
# Script para arrancar el proyecto Iceland Tourism Geoportal en Linux/Mac

echo ""
echo "========================================"
echo "Iceland Tourism Geoportal - Iniciando"
echo "========================================"
echo ""

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "Error: Node.js no está instalado"
    echo "Por favor, instala Node.js desde https://nodejs.org/"
    exit 1
fi

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    echo "Error: npm no está disponible"
    exit 1
fi

echo "Versión de Node.js:"
node --version

echo "Versión de npm:"
npm --version

echo ""
echo "Iniciando servidor en puerto 3000..."
echo "Abre tu navegador en: http://localhost:3000"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo ""

npm start
