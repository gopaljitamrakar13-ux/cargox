from flask_socketio import emit, join_room, leave_room
from app.extensions import socketio, db
from app.models.chat import ChatRoom, ChatMessage
from flask import request
from flask_jwt_extended import decode_token

@socketio.on('connect')
def handle_connect():
    # In a real app, you would parse the token from request.args or headers to authenticate
    print(f"Client connected: {request.sid}")
    emit('connected', {'data': 'Connected to CargoX Chat'})

@socketio.on('disconnect')
def handle_disconnect():
    print(f"Client disconnected: {request.sid}")

@socketio.on('join')
def on_join(data):
    shipment_id = data['shipment_id']
    room = f"shipment_{shipment_id}"
    join_room(room)
    print(f"User joined room {room}")
    emit('status', {'msg': f'User has entered the room.'}, room=room)

@socketio.on('leave')
def on_leave(data):
    shipment_id = data['shipment_id']
    room = f"shipment_{shipment_id}"
    leave_room(room)
    print(f"User left room {room}")
    emit('status', {'msg': f'User has left the room.'}, room=room)

@socketio.on('send_message')
def handle_message(data):
    shipment_id = data.get('shipment_id')
    sender_id = data.get('sender_id')
    content = data.get('content')
    
    room_name = f"shipment_{shipment_id}"
    
    # Ensure a chat room exists for this shipment
    room = ChatRoom.query.filter_by(shipment_id=shipment_id).first()
    if not room:
        room = ChatRoom(shipment_id=shipment_id)
        db.session.add(room)
        db.session.commit()

    # Save to database
    msg = ChatMessage(
        room_id=room.id,
        sender_id=sender_id,
        content=content
    )
    db.session.add(msg)
    db.session.commit()
    
    # Broadcast to room
    emit('receive_message', {
        'id': msg.id,
        'shipment_id': shipment_id,
        'sender_id': sender_id,
        'content': content,
        'created_at': msg.created_at.isoformat()
    }, room=room_name)
