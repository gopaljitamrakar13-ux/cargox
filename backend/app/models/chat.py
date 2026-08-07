import uuid
from datetime import datetime
from app.extensions import db

def generate_uuid():
    return str(uuid.uuid4())

class ChatRoom(db.Model):
    __tablename__ = 'chat_rooms'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    shipment_id = db.Column(db.String(36), db.ForeignKey('shipments.id', ondelete='CASCADE'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    shipment = db.relationship('Shipment', back_populates='chat_rooms')
    messages = db.relationship('Message', back_populates='room', cascade='all, delete-orphan')

class Message(db.Model):
    __tablename__ = 'messages'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    room_id = db.Column(db.String(36), db.ForeignKey('chat_rooms.id', ondelete='CASCADE'), nullable=False)
    sender_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    seen = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    room = db.relationship('ChatRoom', back_populates='messages')
    sender = db.relationship('User')

# Compatibility alias for legacy chat imports
ChatMessage = Message
