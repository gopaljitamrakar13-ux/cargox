import firebase_admin
from firebase_admin import credentials, auth
from flask import current_app, jsonify
from functools import wraps
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from app.models.user import User


def init_firebase(app):
    """Initialize Firebase Admin SDK. Gracefully skips if credentials are not configured."""
    cred_path = app.config.get('FIREBASE_CREDENTIALS', '')
    if not cred_path:
        app.logger.info("Firebase credentials not configured — Firebase features disabled.")
        return
    try:
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        app.logger.info("Firebase Admin SDK initialized successfully.")
    except Exception as e:
        app.logger.warning(f"Firebase initialization failed (Firebase features disabled): {str(e)}")


def verify_firebase_token(id_token):
    """Verify a Firebase ID token. Returns decoded token or None."""
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception:
        return None


def role_required(required_role):
    """Decorator to restrict a route to a specific user role."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user = User.query.get(user_id)

            if not user or not user.role or user.role.name != required_role:
                return jsonify({"error": "Unauthorized Access"}), 403

            return fn(*args, **kwargs)
        return wrapper
    return decorator
