#!/bin/bash
set -e

echo "🚀 Starting Full Deployment"

PROJECT_ROOT=/home/ubuntu/hotel-booking-system
BACKEND_DIR=$PROJECT_ROOT/backend
FRONTEND_BUILD_DIR=$PROJECT_ROOT/frontend/build
VENV_DIR=$BACKEND_DIR/venv

cd $BACKEND_DIR

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "🔁 Pulling latest code from $CURRENT_BRANCH"
git pull origin "$CURRENT_BRANCH" --ff-only

echo "🐍 Activating virtual environment"
source $VENV_DIR/bin/activate

echo "📦 Installing backend dependencies"
pip install --no-cache-dir -r requirements.txt

echo "🧱 Applying migrations"
python manage.py migrate --noinput

echo "📂 Collecting static files"
python manage.py collectstatic --noinput

echo "🖥️ Verifying frontend build"
if [ ! -f "$FRONTEND_BUILD_DIR/index.html" ]; then
  echo "❌ Frontend build missing. Build locally and commit it."
  exit 1
fi

echo "🔄 Restarting Gunicorn"
sudo systemctl restart gunicorn

echo "🌐 Restarting Nginx"
sudo systemctl restart nginx

echo "✅ Deployment completed successfully"
