#!/bin/bash
export DEBIAN_FRONTEND=noninteractive
pwd='T$C5&~+alWo70l^7'

echo "$pwd" | sudo -S dpkg --configure -a || true

# Load user profile for nvm/node paths
source ~/.profile 2>/dev/null || true
source ~/.bashrc 2>/dev/null || true

echo "Extracting code..."
mkdir -p /home/bravvius/backoffice
tar -xzf /home/bravvius/backoffice.tar.gz -C /home/bravvius/backoffice

if ! command -v npm &> /dev/null
then
    echo "Installing Node.js and PM2..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | echo "$pwd" | sudo -S -E bash -
    echo "$pwd" | sudo -S apt install -y nodejs
fi

if ! command -v pm2 &> /dev/null
then
    echo "$pwd" | sudo -S npm install -g pm2 || true
fi

echo "Setting up Backend..."
cd /home/bravvius/backoffice/backend
npm install
npx prisma generate
echo "Running Seed/User script..."
npx tsx create-user.ts || true
echo "Building Backend API..."
npm run build
npx pm2 delete "backoffice-api" 2>/dev/null || true
npx pm2 start dist/main.js --name "backoffice-api"

echo "Setting up Frontend..."
cd /home/bravvius/backoffice/frontend
npm install
echo "Building Frontend App..."
npm run build
pm2 delete "backoffice-web" 2>/dev/null || true
pm2 start npm --name "backoffice-web" -- start

pm2 save
echo "Deployment Finished"
