from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.chat import ChatRoom, ChatMessage
from flask_jwt_extended import jwt_required, get_jwt_identity

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/shipment/<shipment_id>', methods=['GET'])
@jwt_required()
def get_chat_history(shipment_id):
    # In a real app, verify the user has access to this shipment
    room = ChatRoom.query.filter_by(shipment_id=shipment_id).first()
    if not room:
        return jsonify([]), 200

    messages = ChatMessage.query.filter_by(room_id=room.id).order_by(ChatMessage.created_at.asc()).all()
    
    data = [{
        "id": m.id,
        "sender_id": m.sender_id,
        "content": m.content,
        "created_at": m.created_at.isoformat(),
        "is_read": m.seen
    } for m in messages]
    
    return jsonify(data), 200
