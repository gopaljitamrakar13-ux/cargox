from flask import Flask
from flask_cors import CORS
from .config import Config
from .extensions import db, migrate, jwt, bcrypt, socketio

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions with the app
    CORS(
    app,
    resources={r"/api/*": {"origins": ["http://localhost:5173"]}},
    supports_credentials=True
)
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    socketio.init_app(app)

    # Register blueprints
    from app.api.auth import auth_bp
    from app.api.user import user_bp
    from app.api.truck import truck_bp
    from app.api.shipment import shipment_bp
    from app.api.chat import chat_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(user_bp, url_prefix='/api/users')
    app.register_blueprint(truck_bp, url_prefix='/api/trucks')
    app.register_blueprint(shipment_bp, url_prefix='/api/shipments')
    app.register_blueprint(chat_bp, url_prefix='/api/chat')

    # Import socket events so they are registered with the socketio instance
    from app import socket_events  # noqa: F401

    # Health check routes
    @app.route('/health', methods=['GET'])
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return {'status': 'healthy', 'message': 'CargoX API is running'}, 200

    return app
