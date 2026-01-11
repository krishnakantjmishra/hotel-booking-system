#!/bin/bash
set -e

echo "🚀 Starting Django Deployment..."

PROJECT_DIR=/home/ubuntu/hotel-booking-system/backend
VENV_DIR=$PROJECT_DIR/venv

cd $PROJECT_DIR

echo "🔁 Pulling latest code..."
git pull origin main

echo "🐍 Activating virtual environment..."
source $VENV_DIR/bin/activate

echo "📦 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "🧱 Applying migrations..."
python manage.py migrate --noinput

echo "📂 Collecting static files..."
python manage.py collectstatic --noinput

echo "🔄 Restarting Gunicorn..."
sudo systemctl restart gunicorn

echo "🌐 Restarting Nginx..."
sudo systemctl restart nginx

echo "✅ Deployment completed!"
