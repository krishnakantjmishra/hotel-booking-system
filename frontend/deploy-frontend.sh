#!/bin/bash
set -e

echo "🚀 Frontend Deployment Started"

EC2_USER=ubuntu
EC2_IP=16.171.138.117
KEY=~/.ssh/hotel-booking-key.pem
REMOTE_PATH=/home/ubuntu/hotel-booking-system/frontend

echo "� Pulling latest code"
git pull origin main

echo "�📦 Installing dependencies"
npm install

echo "🏗️ Building frontend"
npm run build

echo "📤 Uploading build to EC2"
scp -i $KEY -r build $EC2_USER@$EC2_IP:$REMOTE_PATH/

echo "🔄 Reloading Nginx on EC2"
ssh -i $KEY $EC2_USER@$EC2_IP "sudo systemctl reload nginx"

echo "✅ Frontend deployed successfully"
