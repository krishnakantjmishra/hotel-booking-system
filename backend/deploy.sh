#!/bin/bash
set -e

echo "🚀 Backend Deployment Started"

PROJECT_ROOT=/home/ubuntu/hotel-booking-system
BACKEND_DIR=$PROJECT_ROOT/backend
VENV_DIR=$BACKEND_DIR/venv

cd $BACKEND_DIR

echo "🔁 Pulling latest backend code"
git pull origin main --ff-only

echo "🐍 Activating virtual environment"
source $VENV_DIR/bin/activate

echo "📦 Installing dependencies"
pip install --no-cache-dir -r requirements.txt

echo "🧱 Running migrations"
python manage.py migrate --noinput

echo "📂 Collecting static files"
python manage.py collectstatic --noinput

echo "🔄 Restarting Gunicorn"
sudo systemctl restart gunicorn

echo "🚀 Deploying Microservice"
MICROSERVICE_DIR=$PROJECT_ROOT/microservices/availability_service
cd $MICROSERVICE_DIR

echo "📦 Installing microservice dependencies"
pip install --no-cache-dir -r requirements.txt

echo "🔄 Restarting FastAPI Service"
sudo systemctl restart fastapi

echo "✅ Deployment completed successfully"
