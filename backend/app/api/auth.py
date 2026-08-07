from flask import Blueprint, request, jsonify
from app.extensions import db, bcrypt
from app.models.user import User, Role, Customer, TruckOwner, TransportOwner, Driver
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.utils.auth import verify_firebase_token
import datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_auth_profile():
    """Returns the authenticated user's profile — called by the frontend on page load."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    role = user.role.name if user.role else None

    profile_data = {
        "id": user.id,
        "email": user.email,
        "role": role,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat()
    }

    # Attach role-specific profile fields
    if role == 'Customer' and user.customer_profile:
        profile_data.update({
            "full_name": user.customer_profile.full_name,
            "phone": user.customer_profile.phone,
            "company_name": user.customer_profile.company_name
        })
    elif role == 'TruckOwner' and user.truck_owner_profile:
        profile_data.update({
            "full_name": user.truck_owner_profile.full_name,
            "phone": user.truck_owner_profile.phone,
            "company_name": user.truck_owner_profile.company_name
        })
    elif role == 'TransportOwner' and user.transport_owner_profile:
        profile_data.update({
            "full_name": user.transport_owner_profile.full_name,
            "phone": user.transport_owner_profile.phone,
            "company_name": user.transport_owner_profile.company_name
        })
    elif role == 'Driver' and user.driver_profile:
        profile_data.update({
            "full_name": user.driver_profile.full_name,
            "phone": user.driver_profile.phone,
            "license_number": user.driver_profile.license_number,
            "status": user.driver_profile.status
        })
    elif role == 'Admin':
        profile_data["full_name"] = "Admin"

    return jsonify(profile_data), 200

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    full_name = data.get('full_name')
    role_name = data.get('role', 'Customer') # Default to Customer

    if not email or not password or not full_name:
        return jsonify({"error": "Missing required fields"}), 400
        
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 409

    role = Role.query.filter_by(name=role_name).first()
    if not role:
        # For development purposes, if roles don't exist, create it
        role = Role(name=role_name)
        db.session.add(role)
        db.session.commit()

    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(email=email, password_hash=hashed_pw, role_id=role.id)
    db.session.add(new_user)
    db.session.commit()
    
    # Create specific profile based on role
    if role_name == 'Customer':
        profile = Customer(user_id=new_user.id, full_name=full_name)
    elif role_name == 'TruckOwner':
        profile = TruckOwner(user_id=new_user.id, full_name=full_name)
    elif role_name == 'TransportOwner':
        profile = TransportOwner(user_id=new_user.id, full_name=full_name)
    elif role_name == 'Driver':
        # Default empty license for initial registration
        profile = Driver(user_id=new_user.id, full_name=full_name, license_number="PENDING_" + new_user.id[:8])
    elif role_name == 'Admin':
        pass
    else:
        return jsonify({"error": "Invalid role"}), 400

    if role_name != 'Admin':
        db.session.add(profile)
    
    db.session.commit()

    return jsonify({"message": "User registered successfully", "user_id": new_user.id}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid email or password"}), 401
        
    access_token = create_access_token(identity=user.id)
    
    return jsonify({
        "access_token": access_token,
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role.name if user.role else None
        }
    }), 200

@auth_bp.route('/firebase-login', methods=['POST'])
def firebase_login():
    data = request.get_json()
    id_token = data.get('id_token')
    
    decoded_token = verify_firebase_token(id_token)
    if not decoded_token:
        return jsonify({"error": "Invalid Firebase token"}), 401
        
    email = decoded_token.get('email')
    firebase_uid = decoded_token.get('uid')
    
    user = User.query.filter_by(email=email).first()
    
    # If user doesn't exist, we could auto-register or return error
    if not user:
        return jsonify({"error": "User does not exist in our system. Please register first."}), 404
        
    if not user.firebase_uid:
        user.firebase_uid = firebase_uid
        db.session.commit()
        
    access_token = create_access_token(identity=user.id)
    
    return jsonify({
        "access_token": access_token,
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role.name if user.role else None
        }
    }), 200
