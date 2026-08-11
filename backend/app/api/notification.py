from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.system import Notification
from app.extensions import db

bp = Blueprint('notifications', __name__, url_prefix='/api/notifications')

@bp.route('/', methods=['GET'])
@jwt_required()
def get_notifications():
    user_id = get_jwt_identity()
    notifications = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).all()
    
    return jsonify([{
        "id": n.id,
        "title": n.title,
        "message": n.message,
        "is_read": n.is_read,
        "created_at": n.created_at.isoformat()
    } for n in notifications]), 200

@bp.route('/<string:notification_id>/read', methods=['PUT'])
@jwt_required()
def mark_read(notification_id):
    user_id = get_jwt_identity()
    notification = Notification.query.filter_by(id=notification_id, user_id=user_id).first()
    
    if not notification:
        return jsonify({"error": "Notification not found"}), 404
        
    notification.is_read = True
    db.session.commit()
    return jsonify({"message": "Marked as read"}), 200

@bp.route('/read_all', methods=['PUT'])
@jwt_required()
def mark_all_read():
    user_id = get_jwt_identity()
    Notification.query.filter_by(user_id=user_id, is_read=False).update({"is_read": True})
    db.session.commit()
    return jsonify({"message": "All marked as read"}), 200

@bp.route('/<string:notification_id>', methods=['DELETE'])
@jwt_required()
def delete_notification(notification_id):
    user_id = get_jwt_identity()
    notification = Notification.query.filter_by(id=notification_id, user_id=user_id).first()
    
    if not notification:
        return jsonify({"error": "Notification not found"}), 404
        
    db.session.delete(notification)
    db.session.commit()
    return jsonify({"message": "Deleted successfully"}), 200
