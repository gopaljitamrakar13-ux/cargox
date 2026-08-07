from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.user import User, Customer, TruckOwner, TransportOwner, Driver
from flask_jwt_extended import jwt_required, get_jwt_identity

user_bp = Blueprint('user', __name__)

@user_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
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
        
    return jsonify(profile_data), 200

@user_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    data = request.get_json()
    role = user.role.name if user.role else None
    
    if role == 'Customer' and user.customer_profile:
        user.customer_profile.full_name = data.get('full_name', user.customer_profile.full_name)
        user.customer_profile.phone = data.get('phone', user.customer_profile.phone)
        user.customer_profile.company_name = data.get('company_name', user.customer_profile.company_name)
    elif role == 'TruckOwner' and user.truck_owner_profile:
        user.truck_owner_profile.full_name = data.get('full_name', user.truck_owner_profile.full_name)
        user.truck_owner_profile.phone = data.get('phone', user.truck_owner_profile.phone)
        user.truck_owner_profile.company_name = data.get('company_name', user.truck_owner_profile.company_name)
    elif role == 'TransportOwner' and user.transport_owner_profile:
        user.transport_owner_profile.full_name = data.get('full_name', user.transport_owner_profile.full_name)
        user.transport_owner_profile.phone = data.get('phone', user.transport_owner_profile.phone)
        user.transport_owner_profile.company_name = data.get('company_name', user.transport_owner_profile.company_name)
    elif role == 'Driver' and user.driver_profile:
        user.driver_profile.full_name = data.get('full_name', user.driver_profile.full_name)
        user.driver_profile.phone = data.get('phone', user.driver_profile.phone)
        user.driver_profile.license_number = data.get('license_number', user.driver_profile.license_number)
    
    db.session.commit()
    
    return jsonify({"message": "Profile updated successfully"}), 200
