import os
from dotenv import load_dotenv
from datetime import timedelta

# Load environment variables from .env
load_dotenv()


class Config:

    # =========================
    # App Settings
    # =========================
    FLASK_ENV = os.getenv('FLASK_ENV', 'production')
    SECRET_KEY = os.getenv('SECRET_KEY')
    
    if not SECRET_KEY:
        if FLASK_ENV == 'production':
            raise RuntimeError("SECRET_KEY environment variable is missing. It is required in production.")
        SECRET_KEY = 'super-secret-key-cargox'
        
    DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() in ('true', '1')

    # =========================
    # Database Settings
    # =========================
    _DATABASE_URL = os.getenv('DATABASE_URL')

    # Render provides postgres:// but SQLAlchemy requires postgresql://
    if _DATABASE_URL and _DATABASE_URL.startswith('postgres://'):
        _DATABASE_URL = _DATABASE_URL.replace('postgres://', 'postgresql://', 1)

    # In production, DATABASE_URL MUST be set. Never fall back to SQLite in prod.
    if not _DATABASE_URL:
        if FLASK_ENV == 'production':
            raise RuntimeError(
                "DATABASE_URL environment variable is not set. "
                "CargoX requires a PostgreSQL database. "
                "Set DATABASE_URL=postgresql://user:pass@host:5432/dbname"
            )
        # Development fallback only
        _DATABASE_URL = 'sqlite:///cargox_dev.db'

    SQLALCHEMY_DATABASE_URI = _DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # =========================
    # CORS Settings
    # =========================
    # Comma-separated list of allowed origins, e.g.:
    # FRONTEND_URL=http://localhost:5173,https://cargox.onrender.com
    _frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
    CORS_ORIGINS = [origin.strip() for origin in _frontend_url.split(',')]

    # =========================
    # JWT Settings
    # =========================
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    if not JWT_SECRET_KEY:
        if FLASK_ENV == 'production':
            raise RuntimeError("JWT_SECRET_KEY environment variable is missing. It is required in production.")
        JWT_SECRET_KEY = 'jwt-secret-key-cargox'
        
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)

    # =========================
    # Firebase Settings
    # =========================
    FIREBASE_CREDENTIALS = os.getenv('FIREBASE_CREDENTIALS', '')