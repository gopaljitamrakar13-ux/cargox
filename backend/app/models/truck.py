import uuid
from app.extensions import db

def generate_uuid():
    return str(uuid.uuid4())

class Truck(db.Model):
    __tablename__ = 'trucks'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    owner_id = db.Column(db.String(36), db.ForeignKey('truck_owners.id'), nullable=False)
    transport_id = db.Column(db.String(36), db.ForeignKey('transport_owners.id'), nullable=True)
    registration_number = db.Column(db.String(50), unique=True, nullable=False)
    capacity_tons = db.Column(db.Numeric(5, 2), nullable=False)
    truck_type = db.Column(db.String(50))
    status = db.Column(db.Enum('AVAILABLE', 'IN_TRANSIT', 'MAINTENANCE', name='truck_status'), default='AVAILABLE')

    owner = db.relationship('TruckOwner', back_populates='trucks')
    transport = db.relationship('TransportOwner', back_populates='trucks')
    shipments = db.relationship('Shipment', back_populates='truck')
