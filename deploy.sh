#!/bin/bash
# ============================================================
# deploy.sh — Script de despliegue en VPS
# Ejecutar desde la carpeta del proyecto: bash deploy.sh
# ============================================================

set -e  # Detener si hay error

echo ""
echo "▦ MetricHub — Deploy Script"
echo "================================"

# Variables — ajustar si tu VPS tiene otra configuración
DEPLOY_DIR="/var/www/metricas"
NGINX_SITE="metricas"

# 1. Instalar dependencias
echo ""
echo "→ Instalando dependencias..."
npm install

# 2. Build de producción
echo ""
echo "→ Construyendo para producción..."
npm run build

# 3. Crear carpeta de destino si no existe
echo ""
echo "→ Copiando archivos al servidor..."
sudo mkdir -p $DEPLOY_DIR

# 4. Limpiar carpeta anterior y copiar nuevo build
sudo rm -rf $DEPLOY_DIR/*
sudo cp -r dist/* $DEPLOY_DIR/

# 5. Instalar PM2 y levantar backend
echo ""
echo "→ Configurando backend Node.js (PM2)..."
cd $DEPLOY_DIR
sudo npm install -g pm2
# Iniciar o recargar el proceso llamado 'metricas-api'
sudo pm2 ls | grep -q "metricas-api" && sudo pm2 reload metricas-api || sudo pm2 start server.js --name "metricas-api"
sudo pm2 save

# 6. Dar permisos correctos a Nginx
sudo chown -R www-data:www-data $DEPLOY_DIR
sudo chmod -R 755 $DEPLOY_DIR

# 7. Recargar Nginx
echo ""
echo "→ Recargando Nginx..."
sudo systemctl reload nginx

echo ""
echo "✓ Deploy completado exitosamente"
echo "  Sitio disponible en: https://metrics.tudominio.com"
echo ""
