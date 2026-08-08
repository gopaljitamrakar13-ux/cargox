import os
from dotenv import load_dotenv
from datetime import timedelta

# Load environment variables from .env
load_dotenv()


class Config:

    # =========================
    # App Settings
    # =========================
    SECRET_KEY = os.getenv(
        'SECRET_KEY',
        'super-secret-key-cargox'
    )

    # =========================
    # Database Settings
    # =========================
    DATABASE_URL = os.getenv('DATABASE_URL')

    # Render may provide postgres://
    # SQLAlchemy expects postgresql://
    if DATABASE_URL and DATABASE_URL.startswith('postgres://'):
        DATABASE_URL = DATABASE_URL.replace(
            'postgres://',
            'postgresql://',
            1
        )

    SQLALCHEMY_DATABASE_URI = DATABASE_URL or 'sqlite:///cargox.db'

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # =========================
    # JWT Settings
    # =========================
    JWT_SECRET_KEY = os.getenv(
        'JWT_SECRET_KEY',
        'jwt-secret-key-cargox'
    )

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)

    # =========================
    # Firebase Settings
    # =========================
    FIREBASE_CREDENTIALS = os.getenv(
        'FIREBASE_CREDENTIALS',
        'firebase-adminsdk.json'
    )