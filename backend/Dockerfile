FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    libmariadb-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN python -m pip install --upgrade pip
RUN python -m pip install --no-cache-dir -r requirements.txt
RUN python -m pip install --no-cache-dir gunicorn
RUN python -m gunicorn --version

COPY . .

EXPOSE 5000

CMD ["sh", "-c", "python -m gunicorn --workers 1 --bind 0.0.0.0:${PORT:-5000} run:app"]