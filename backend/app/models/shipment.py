import uuid
from datetime import datetime
from app.extensions import db

def generate_uuid():
    return str(uuid.uuid4())

class Shipment(db.Model):
    __tablename__ = 'shipments'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    customer_id = db.Column(db.String(36), db.ForeignKey('customers.id'), nullable=False)
    pickup_address = db.Column(db.Text, nullable=False)
    dropoff_address = db.Column(db.Text, nullable=False)
    pickup_lat = db.Column(db.Numeric(10, 8))
    pickup_lng = db.Column(db.Numeric(11, 8))
    dropoff_lat = db.Column(db.Numeric(10, 8))
    dropoff_lng = db.Column(db.Numeric(11, 8))
    weight_tons = db.Column(db.Numeric(5, 2))
    material_type = db.Column(db.String(100))
    status = db.Column(db.Enum('PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', name='shipment_status'), default='PENDING')
    price = db.Column(db.Numeric(10, 2))
    truck_id = db.Column(db.String(36), db.ForeignKey('trucks.id'))
    driver_id = db.Column(db.String(36), db.ForeignKey('drivers.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    customer = db.relationship('Customer', back_populates='shipments')
    truck = db.relationship('Truck', back_populates='shipments')
    driver = db.relationship('Driver', back_populates='shipments')
    tracking = db.relationship('ShipmentTracking', back_populates='shipment', cascade='all, delete-orphan')
    route = db.relationship('Route', back_populates='shipment', uselist=False, cascade='all, delete-orphan')
    payments = db.relationship('Payment', back_populates='shipment', cascade='all, delete-orphan')
    chat_rooms = db.relationship('ChatRoom', back_populates='shipment', cascade='all, delete-orphan')
    reviews = db.relationship('Review', back_populates='shipment', cascade='all, delete-orphan')

class ShipmentTracking(db.Model):
    __tablename__ = 'shipment_tracking'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    shipment_id = db.Column(db.String(36), db.ForeignKey('shipments.id', ondelete='CASCADE'), nullable=False)
    lat = db.Column(db.Numeric(10, 8), nullable=False)
    lng = db.Column(db.Numeric(11, 8), nullable=False)
    status = db.Column(db.String(50))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    shipment = db.relationship('Shipment', back_populates='tracking')

class Route(db.Model):
    __tablename__ = 'routes'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    shipment_id = db.Column(db.String(36), db.ForeignKey('shipments.id', ondelete='CASCADE'), nullable=False)
    polyline = db.Column(db.Text)
    distance_km = db.Column(db.Numeric(8, 2))
    eta_minutes = db.Column(db.Integer)

    shipment = db.relationship('Shipment', back_populates='route')

class Payment(db.Model):
    __tablename__ = 'payments'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    shipment_id = db.Column(db.String(36), db.ForeignKey('shipments.id'), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    status = db.Column(db.Enum('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', name='payment_status'), default='PENDING')
    method = db.Column(db.String(50))
    transaction_id = db.Column(db.String(100), unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    shipment = db.relationship('Shipment', back_populates='payments')

class Review(db.Model):
    __tablename__ = 'reviews'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    reviewer_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    reviewee_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    shipment_id = db.Column(db.String(36), db.ForeignKey('shipments.id'), nullable=False)
    rating = db.Column(db.Integer)
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    shipment = db.relationship('Shipment', back_populates='reviews')
    reviewer = db.relationship('User', foreign_keys=[reviewer_id])
    reviewee = db.relationship('User', foreign_keys=[reviewee_id])
