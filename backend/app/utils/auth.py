import firebase_admin
from firebase_admin import credentials, auth
from flask import current_app, request, jsonify
from functools import wraps
from flask_jwt_extended import create_access_token, get_jwt_identity, verify_jwt_in_request
from app.models.user import User

# Initialize Firebase (Call this manually later if the app is started)
def init_firebase(app):
    cred_path = app.config.get('FIREBASE_CREDENTIALS')
    try:
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    except Exception as e:
        app.logger.warning(f"Firebase initialization failed (skip if testing): {str(e)}")

def verify_firebase_token(id_token):
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        return None

def role_required(required_role):
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
