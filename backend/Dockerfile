# Use slim Python image for smaller size
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies if needed (for psycopg2)
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    gcc \
    python3-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better Docker layer caching
COPY requirements.txt /app/

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code (this layer rebuilds when code changes)
COPY . /app/

# Expose port for Django
EXPOSE 8000

# Run Django server using gunicorn (production style)
CMD ["gunicorn", "core.wsgi:application", "--bind", "0.0.0.0:8000"]
#add dockerfile