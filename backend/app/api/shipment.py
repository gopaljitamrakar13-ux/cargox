from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.shipment import Shipment, ShipmentTracking, Route
from app.models.user import User
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.system import Notification

shipment_bp = Blueprint('shipment', __name__)

@shipment_bp.route('/', methods=['POST'])
@jwt_required()
def create_shipment():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or user.role.name != 'Customer':
        return jsonify({"error": "Only customers can create shipments"}), 403
        
    data = request.get_json()
    
    try:
        new_shipment = Shipment(
            customer_id=user.customer_profile.id,
            pickup_address=data['pickup_address'],
            dropoff_address=data['dropoff_address'],
            pickup_lat=data.get('pickup_lat'),
            pickup_lng=data.get('pickup_lng'),
            dropoff_lat=data.get('dropoff_lat'),
            dropoff_lng=data.get('dropoff_lng'),
            weight_tons=data.get('weight_tons'),
            material_type=data.get('material_type'),
            price=data.get('price', 0)
        )
        db.session.add(new_shipment)
        db.session.commit()
        return jsonify({"message": "Shipment created", "id": new_shipment.id}), 201
    except KeyError as e:
        return jsonify({"error": f"Missing required field: {str(e)}"}), 400

@shipment_bp.route('/', methods=['GET'])
@jwt_required()
def list_shipments():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.role.name == 'Admin':
        shipments = Shipment.query.all()
    elif user.role.name == 'Customer':
        shipments = Shipment.query.filter_by(customer_id=user.customer_profile.id).all()
    elif user.role.name == 'Driver':
        shipments = Shipment.query.filter_by(driver_id=user.driver_profile.id).all()
    elif user.role.name == 'TruckOwner':
        truck_ids = [t.id for t in user.truck_owner_profile.trucks] if user.truck_owner_profile else []
        shipments = Shipment.query.filter(Shipment.truck_id.in_(truck_ids)).all() if truck_ids else []
    elif user.role.name == 'TransportOwner':
        truck_ids = [t.id for t in user.transport_owner_profile.trucks] if user.transport_owner_profile else []
        shipments = Shipment.query.filter(Shipment.truck_id.in_(truck_ids)).all() if truck_ids else []
    else:
        shipments = []
        
    data = [{
        "id": s.id,
        "pickup_address": s.pickup_address,
        "dropoff_address": s.dropoff_address,
        "pickup_lat": float(s.pickup_lat) if s.pickup_lat else None,
        "pickup_lng": float(s.pickup_lng) if s.pickup_lng else None,
        "dropoff_lat": float(s.dropoff_lat) if s.dropoff_lat else None,
        "dropoff_lng": float(s.dropoff_lng) if s.dropoff_lng else None,
        "material_type": s.material_type,
        "status": s.status,
        "weight_tons": float(s.weight_tons) if s.weight_tons else None,
        "price": float(s.price) if s.price else None,
        "created_at": s.created_at.isoformat()
    } for s in shipments]
    
    return jsonify(data), 200

@shipment_bp.route('/<shipment_id>/tracking', methods=['GET'])
@jwt_required()
def get_tracking(shipment_id):
    tracking_records = ShipmentTracking.query.filter_by(shipment_id=shipment_id).order_by(ShipmentTracking.timestamp.desc()).all()
    
    # Ideally, would just return latest, but returning list for history
    data = [{
        "lat": float(t.lat),
        "lng": float(t.lng),
        "status": t.status,
        "timestamp": t.timestamp.isoformat()
    } for t in tracking_records]
    
    return jsonify(data), 200

@shipment_bp.route('/<shipment_id>', methods=['PUT'])
@jwt_required()
def update_shipment(shipment_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    shipment = Shipment.query.get(shipment_id)
    if not shipment:
        return jsonify({"error": "Shipment not found"}), 404
        
    is_admin = user.role.name == 'Admin'
    is_customer = hasattr(user, 'customer_profile') and user.customer_profile and shipment.customer_id == user.customer_profile.id
    is_driver = hasattr(user, 'driver_profile') and user.driver_profile and shipment.driver_id == user.driver_profile.id
    
    if not (is_admin or is_customer or is_driver):
        return jsonify({"error": "Unauthorized to edit this shipment"}), 403
        
    data = request.get_json()
    
    if 'pickup_address' in data and (is_admin or is_customer):
        shipment.pickup_address = data['pickup_address']
    if 'dropoff_address' in data and (is_admin or is_customer):
        shipment.dropoff_address = data['dropoff_address']
    if 'weight_tons' in data and (is_admin or is_customer):
        shipment.weight_tons = data['weight_tons']
    if 'material_type' in data and (is_admin or is_customer):
        shipment.material_type = data['material_type']
    if 'status' in data and (is_admin or is_driver):
        shipment.status = data['status']
        
        if data['status'] == 'DELIVERED' and is_driver:
            user.driver_profile.status = 'AVAILABLE'
        elif data['status'] == 'IN_TRANSIT' and is_driver:
            user.driver_profile.status = 'ON_TRIP'
            
    db.session.commit()
    return jsonify({"message": "Shipment updated successfully"}), 200

@shipment_bp.route('/<shipment_id>', methods=['DELETE'])
@jwt_required()
def delete_shipment(shipment_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    shipment = Shipment.query.get(shipment_id)
    if not shipment:
        return jsonify({"error": "Shipment not found"}), 404
        
    if user.role.name != 'Admin' and (not hasattr(user, 'customer_profile') or not user.customer_profile or shipment.customer_id != user.customer_profile.id):
        return jsonify({"error": "Unauthorized to delete this shipment"}), 403
        
    db.session.delete(shipment)
    db.session.commit()
    return jsonify({"message": "Shipment deleted successfully"}), 200

@shipment_bp.route('/<shipment_id>/sos', methods=['POST'])
@jwt_required()
def report_sos(shipment_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    shipment = Shipment.query.get(shipment_id)
    if not shipment:
        return jsonify({"error": "Shipment not found"}), 404
        
    is_driver = hasattr(user, 'driver_profile') and user.driver_profile and shipment.driver_id == user.driver_profile.id
    
    if not is_driver:
        return jsonify({"error": "Unauthorized to report SOS for this shipment"}), 403
        
    # Notify Transport Owner
    if shipment.truck and shipment.truck.transport:
        transport_owner = shipment.truck.transport.user
        notif = Notification(
            user_id=transport_owner.id,
            title=f"🚨 SOS ALERT: Shipment {shipment.id[:8]}",
            message=f"Driver {user.driver_profile.full_name} reported an emergency on route."
        )
        db.session.add(notif)
        
    # Notify Customer
    if shipment.customer:
        notif = Notification(
            user_id=shipment.customer.user_id,
            title=f"🚨 SOS ALERT: Shipment {shipment.id[:8]}",
            message=f"An emergency was reported by the driver for your shipment."
        )
        db.session.add(notif)
        
    db.session.commit()
    return jsonify({"message": "SOS reported successfully"}), 200
