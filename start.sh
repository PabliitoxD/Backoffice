#!/bin/sh

if [ "$START_MODE" = "api" ]; then
    echo "Starting Backend API..."
    cd /app/backend
    # Prisma generate needs to be run or already run in build
    npm run start:prod
elif [ "$START_MODE" = "web" ]; then
    echo "Starting Frontend Web..."
    cd /app/frontend
    npm start
else
    # Fallback to starting both using PM2 if desired, or failing
    echo "Please set START_MODE to 'api' or 'web'."
    echo "Fallback: starting both with PM2..."
    cd /app
    pm2-runtime start ecosystem.config.js
fi
