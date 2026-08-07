from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.truck import Truck
from app.models.user import User
from flask_jwt_extended import jwt_required, get_jwt_identity

truck_bp = Blueprint('truck', __name__)

@truck_bp.route('/', methods=['POST'])
@jwt_required()
def add_truck():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or user.role.name not in ['TruckOwner', 'TransportOwner', 'Admin']:
        return jsonify({"error": "Unauthorized to add trucks"}), 403
        
    data = request.get_json()
    registration_number = data.get('registration_number')
    capacity_tons = data.get('capacity_tons')
    truck_type = data.get('truck_type')
    
    if not registration_number or not capacity_tons:
        return jsonify({"error": "Missing required fields"}), 400
        
    if Truck.query.filter_by(registration_number=registration_number).first():
        return jsonify({"error": "Truck with this registration number already exists"}), 409
        
    owner_id = user.truck_owner_profile.id if user.role.name == 'TruckOwner' else None
    transport_id = user.transport_owner_profile.id if user.role.name == 'TransportOwner' else None
    
    if not owner_id and not transport_id:
        return jsonify({"error": "Profile not setup correctly"}), 400

    new_truck = Truck(
        owner_id=owner_id or transport_id, # Simplified for demo
        transport_id=transport_id,
        registration_number=registration_number,
        capacity_tons=capacity_tons,
        truck_type=truck_type
    )
    
    db.session.add(new_truck)
    db.session.commit()
    
    return jsonify({"message": "Truck added successfully", "truck_id": new_truck.id}), 201

@truck_bp.route('/', methods=['GET'])
@jwt_required()
def list_trucks():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.role.name == 'Admin':
        trucks = Truck.query.all()
    elif user.role.name == 'TruckOwner':
        trucks = Truck.query.filter_by(owner_id=user.truck_owner_profile.id).all()
    elif user.role.name == 'TransportOwner':
        trucks = Truck.query.filter_by(transport_id=user.transport_owner_profile.id).all()
    else:
        return jsonify({"error": "Unauthorized"}), 403
        
    truck_list = [{
        "id": t.id,
        "registration_number": t.registration_number,
        "capacity_tons": float(t.capacity_tons),
        "truck_type": t.truck_type,
        "status": t.status
    } for t in trucks]
    
    return jsonify(truck_list), 200
