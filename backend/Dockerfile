FROM python:3.11-slim

WORKDIR /app

# Install PostgreSQL client libraries only (NOT MySQL/MariaDB)
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/requirements.txt

RUN python -m pip install --upgrade pip && \
    python -m pip install --no-cache-dir -r /app/requirements.txt

# Verify PostgreSQL driver was installed
RUN python -c "import psycopg2; print('psycopg2 OK:', psycopg2.__version__)"

COPY . /app

# PORT is injected by Render at runtime; default to 10000 (Render's default)
ENV PORT=10000

CMD ["sh", "-c", "gunicorn --worker-class eventlet --workers 1 --bind 0.0.0.0:${PORT} run:app"]