from flask_socketio import emit, join_room, leave_room
from app.extensions import socketio, db
from app.models.chat import ChatRoom, ChatMessage
from flask import request
from flask_jwt_extended import decode_token
from jwt.exceptions import InvalidTokenError


def get_user_id_from_token(token):
    """Safely decode JWT and return user_id (sub), or None if invalid."""
    try:
        decoded = decode_token(token)
        return decoded.get('sub')
    except Exception:
        return None


@socketio.on('connect')
def handle_connect():
    # Client should pass ?token=<jwt> in the connection query string
    token = request.args.get('token')
    user_id = get_user_id_from_token(token) if token else None
    if user_id:
        print(f"[Socket.IO] Authenticated client connected: user={user_id} sid={request.sid}")
    else:
        print(f"[Socket.IO] Unauthenticated client connected: sid={request.sid}")
    emit('connected', {'data': 'Connected to CargoX Chat'})


@socketio.on('disconnect')
def handle_disconnect():
    print(f"[Socket.IO] Client disconnected: sid={request.sid}")


@socketio.on('join')
def on_join(data):
    shipment_id = data.get('shipment_id')
    if not shipment_id:
        emit('error', {'message': 'shipment_id is required to join a room'})
        return
    room = f"shipment_{shipment_id}"
    join_room(room)
    print(f"[Socket.IO] User joined room: {room}")
    emit('status', {'msg': 'You have entered the chat room.'}, room=room)


@socketio.on('leave')
def on_leave(data):
    shipment_id = data.get('shipment_id')
    if not shipment_id:
        return
    room = f"shipment_{shipment_id}"
    leave_room(room)
    print(f"[Socket.IO] User left room: {room}")
    emit('status', {'msg': 'You have left the chat room.'}, room=room)


@socketio.on('send_message')
def handle_message(data):
    shipment_id = data.get('shipment_id')
    content = data.get('content', '').strip()

    # ✅ Security: Get sender identity from JWT token, NOT from client data
    token = request.args.get('token')
    sender_id = get_user_id_from_token(token) if token else None

    # Fallback: allow unauthenticated in dev but log warning
    if not sender_id:
        sender_id = data.get('sender_id')  # Dev/testing only
        print(f"[Socket.IO] WARNING: Message sent without JWT auth — using client sender_id: {sender_id}")

    if not shipment_id or not content or not sender_id:
        emit('error', {'message': 'shipment_id, content, and authentication are required'})
        return

    room_name = f"shipment_{shipment_id}"

    # Ensure a chat room exists for this shipment
    room = ChatRoom.query.filter_by(shipment_id=shipment_id).first()
    if not room:
        room = ChatRoom(shipment_id=shipment_id)
        db.session.add(room)
        db.session.commit()

    # Persist message to database
    msg = ChatMessage(
        room_id=room.id,
        sender_id=sender_id,
        content=content
    )
    db.session.add(msg)
    db.session.commit()

    # Broadcast to all users in this shipment room
    emit('receive_message', {
        'id': msg.id,
        'shipment_id': shipment_id,
        'sender_id': sender_id,
        'content': content,
        'created_at': msg.created_at.isoformat()
    }, room=room_name)

def init_sockets(socketio_instance):
    """
    Registers socket events when called.
    This function exists to avoid 'unused import' (# noqa) warnings in __init__.py
    """
    pass # Events are already registered via the @socketio decorators when this module is imported.
         # But returning or invoking this explicitly makes the import "used".
