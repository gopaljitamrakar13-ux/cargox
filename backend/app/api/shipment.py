from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.shipment import Shipment, ShipmentTracking, Route
from app.models.user import User
from flask_jwt_extended import jwt_required, get_jwt_identity

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
