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

    if not user or not user.role or user.role.name not in ['TruckOwner', 'TransportOwner', 'Admin']:
        return jsonify({"error": "Unauthorized to add trucks"}), 403

    data = request.get_json()
    registration_number = data.get('registration_number')
    capacity_tons = data.get('capacity_tons')
    truck_type = data.get('truck_type', 'Open')

    if not registration_number or not capacity_tons:
        return jsonify({"error": "Missing required fields: registration_number, capacity_tons"}), 400

    if Truck.query.filter_by(registration_number=registration_number).first():
        return jsonify({"error": "Truck with this registration number already exists"}), 409

    # Resolve owner_id and transport_id based on user role
    owner_id = None
    transport_id = None

    if user.role.name == 'TruckOwner':
        if not user.truck_owner_profile:
            return jsonify({"error": "TruckOwner profile not found. Please complete your profile."}), 400
        owner_id = user.truck_owner_profile.id

    elif user.role.name == 'TransportOwner':
        if not user.transport_owner_profile:
            return jsonify({"error": "TransportOwner profile not found. Please complete your profile."}), 400
        # TransportOwner acts as both owner and transport for their own trucks
        owner_id = user.transport_owner_profile.id
        transport_id = user.transport_owner_profile.id

    elif user.role.name == 'Admin':
        # Admin: must supply owner_id in body, or we return an error
        owner_id = data.get('owner_id')
        if not owner_id:
            return jsonify({"error": "Admin must provide owner_id when adding a truck"}), 400

    if not owner_id:
        return jsonify({"error": "Could not resolve truck owner. Profile may not be set up."}), 400

    new_truck = Truck(
        owner_id=owner_id,
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

    if not user or not user.role:
        return jsonify({"error": "Unauthorized"}), 403

    if user.role.name == 'Admin':
        trucks = Truck.query.all()
    elif user.role.name == 'TruckOwner':
        if not user.truck_owner_profile:
            return jsonify([]), 200
        trucks = Truck.query.filter_by(owner_id=user.truck_owner_profile.id).all()
    elif user.role.name == 'TransportOwner':
        if not user.transport_owner_profile:
            return jsonify([]), 200
        trucks = Truck.query.filter_by(transport_id=user.transport_owner_profile.id).all()
    else:
        return jsonify({"error": "Unauthorized — only truck/transport owners can view fleet"}), 403

    truck_list = [{
        "id": t.id,
        "registration_number": t.registration_number,
        "capacity_tons": float(t.capacity_tons),
        "truck_type": t.truck_type,
        "status": t.status
    } for t in trucks]

    return jsonify(truck_list), 200


@truck_bp.route('/<truck_id>', methods=['PUT'])
@jwt_required()
def update_truck(truck_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    truck = Truck.query.get(truck_id)
    if not truck:
        return jsonify({"error": "Truck not found"}), 404

    # Authorization check
    if user.role.name == 'TruckOwner' and truck.owner_id != user.truck_owner_profile.id:
        return jsonify({"error": "Forbidden — not your truck"}), 403
    elif user.role.name == 'TransportOwner' and truck.transport_id != user.transport_owner_profile.id:
        return jsonify({"error": "Forbidden — not your truck"}), 403
    elif user.role.name not in ['TruckOwner', 'TransportOwner', 'Admin']:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    truck.truck_type = data.get('truck_type', truck.truck_type)
    truck.capacity_tons = data.get('capacity_tons', truck.capacity_tons)
    truck.status = data.get('status', truck.status)

    db.session.commit()
    return jsonify({"message": "Truck updated successfully"}), 200


@truck_bp.route('/<truck_id>', methods=['DELETE'])
@jwt_required()
def delete_truck(truck_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    truck = Truck.query.get(truck_id)
    if not truck:
        return jsonify({"error": "Truck not found"}), 404

    if user.role.name == 'TruckOwner' and truck.owner_id != user.truck_owner_profile.id:
        return jsonify({"error": "Forbidden — not your truck"}), 403
    elif user.role.name not in ['TruckOwner', 'TransportOwner', 'Admin']:
        return jsonify({"error": "Unauthorized"}), 403

    db.session.delete(truck)
    db.session.commit()
    return jsonify({"message": "Truck deleted successfully"}), 200
