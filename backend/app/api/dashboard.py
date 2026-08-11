from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User, Customer, TruckOwner, TransportOwner, Driver
from app.models.shipment import Shipment, Payment
from app.models.truck import Truck
from app.extensions import db
from sqlalchemy import func

bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

@bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    role_name = user.role.name if user.role else 'CUSTOMER'
    
    if role_name == 'CUSTOMER':
        customer = Customer.query.filter_by(user_id=user.id).first()
        if not customer:
            return jsonify({"error": "Customer profile not found"}), 404
            
        active_shipments = Shipment.query.filter_by(customer_id=customer.id, status='IN_TRANSIT').count()
        total_shipments = Shipment.query.filter_by(customer_id=customer.id).count()
        pending_payments = Shipment.query.filter_by(customer_id=customer.id, status='PENDING').count()
        
        return jsonify({
            "active_shipments": active_shipments,
            "pending_payments": pending_payments,
            "total_shipments": total_shipments
        }), 200
        
    elif role_name == 'TRANSPORT_OWNER':
        transport = TransportOwner.query.filter_by(user_id=user.id).first()
        if not transport:
            return jsonify({"error": "Transport owner profile not found"}), 404
            
        total_fleet = Truck.query.filter_by(transport_id=transport.id).count()
        
        # Count active drivers assigned to these trucks (mocked by active trips if driver relation isn't direct)
        active_trips = Shipment.query.join(Truck).filter(
            Truck.transport_id == transport.id,
            Shipment.status == 'IN_TRANSIT'
        ).count()
        
        active_drivers = Shipment.query.join(Truck).filter(
            Truck.transport_id == transport.id,
            Shipment.status == 'IN_TRANSIT',
            Shipment.driver_id != None
        ).distinct(Shipment.driver_id).count()
        
        # Calculate revenue for completed shipments assigned to this transport owner's trucks
        revenue_result = db.session.query(func.sum(Shipment.price)).join(Truck).filter(
            Truck.transport_id == transport.id,
            Shipment.status == 'DELIVERED'
        ).scalar()
        
        revenue = float(revenue_result) if revenue_result else 0.0
        
        return jsonify({
            "total_fleet": total_fleet,
            "active_drivers": active_drivers,
            "active_trips": active_trips,
            "monthly_revenue": revenue
        }), 200
        
    elif role_name == 'TRUCK_OWNER':
        owner = TruckOwner.query.filter_by(user_id=user.id).first()
        if not owner:
            return jsonify({"error": "Truck owner profile not found"}), 404
            
        total_fleet = Truck.query.filter_by(owner_id=owner.id).count()
        active_trips = Shipment.query.join(Truck).filter(
            Truck.owner_id == owner.id,
            Shipment.status == 'IN_TRANSIT'
        ).count()
        
        return jsonify({
            "total_fleet": total_fleet,
            "active_trips": active_trips
        }), 200
        
    elif role_name == 'DRIVER':
        driver = Driver.query.filter_by(user_id=user.id).first()
        if not driver:
            return jsonify({"error": "Driver profile not found"}), 404
            
        return jsonify({
            "status": driver.status
        }), 200

    return jsonify({"error": "Unsupported role"}), 400
