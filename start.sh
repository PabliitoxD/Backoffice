#!/bin/sh

# Rodar migrações do Prisma para garantir que o banco esteja sincronizado
echo "Running database migrations..."
cd /app/backend
npx prisma migrate deploy

# Iniciar as aplicações (Backend e Frontend) usando o ecosystem.config.js
echo "Starting applications with PM2..."
cd /app
pm2-runtime start ecosystem.config.js
