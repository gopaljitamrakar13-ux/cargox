import uuid
from datetime import datetime
from app.extensions import db

def generate_uuid():
    return str(uuid.uuid4())

class Role(db.Model):
    __tablename__ = 'roles'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    name = db.Column(db.String(50), unique=True, nullable=False)
    
    users = db.relationship('User', back_populates='role')

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    firebase_uid = db.Column(db.String(128), unique=True, nullable=True)
    role_id = db.Column(db.String(36), db.ForeignKey('roles.id'), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    role = db.relationship('Role', back_populates='users')
    customer_profile = db.relationship('Customer', back_populates='user', uselist=False, cascade='all, delete-orphan')
    truck_owner_profile = db.relationship('TruckOwner', back_populates='user', uselist=False, cascade='all, delete-orphan')
    transport_owner_profile = db.relationship('TransportOwner', back_populates='user', uselist=False, cascade='all, delete-orphan')
    driver_profile = db.relationship('Driver', back_populates='user', uselist=False, cascade='all, delete-orphan')

class Customer(db.Model):
    __tablename__ = 'customers'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))
    company_name = db.Column(db.String(100))

    user = db.relationship('User', back_populates='customer_profile')
    shipments = db.relationship('Shipment', back_populates='customer', cascade='all, delete-orphan')

class TruckOwner(db.Model):
    __tablename__ = 'truck_owners'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))
    company_name = db.Column(db.String(100))

    user = db.relationship('User', back_populates='truck_owner_profile')
    trucks = db.relationship('Truck', back_populates='owner')

class TransportOwner(db.Model):
    __tablename__ = 'transport_owners'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))
    company_name = db.Column(db.String(100))

    user = db.relationship('User', back_populates='transport_owner_profile')
    trucks = db.relationship('Truck', back_populates='transport')

class Driver(db.Model):
    __tablename__ = 'drivers'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))
    license_number = db.Column(db.String(50), unique=True, nullable=False)
    status = db.Column(db.Enum('AVAILABLE', 'ON_TRIP', 'OFF_DUTY', name='driver_status'), default='AVAILABLE')

    user = db.relationship('User', back_populates='driver_profile')
    shipments = db.relationship('Shipment', back_populates='driver')
