from flask import Flask
from flask_cors import CORS
from .config import Config
from .extensions import db, migrate, jwt, bcrypt, socketio
from .errors import register_error_handlers


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize CORS with origins from environment variable
    # Development: http://localhost:3000
    # Production:  https://your-frontend.onrender.com
    CORS(
        app,
        resources={r"/api/*": {"origins": app.config['CORS_ORIGINS']}},
        supports_credentials=True
    )

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    socketio.init_app(
        app,
        cors_allowed_origins=app.config['CORS_ORIGINS'],
        async_mode='eventlet',
        logger=False,
        engineio_logger=False
    )

    # Register global JSON error handlers
    register_error_handlers(app)

    # Register blueprints
    from app.api.auth import auth_bp
    from app.api.user import user_bp
    from app.api.truck import truck_bp
    from app.api.shipment import shipment_bp
    from app.api.chat import chat_bp
    from app.api.dashboard import bp as dashboard_bp
    from app.api.notification import bp as notification_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(user_bp, url_prefix='/api/users')
    app.register_blueprint(truck_bp, url_prefix='/api/trucks')
    app.register_blueprint(shipment_bp, url_prefix='/api/shipments')
    app.register_blueprint(chat_bp, url_prefix='/api/chat')
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(notification_bp)

    # Import and register Socket.IO events
    from app import socket_events
    socket_events.init_sockets(socketio)

    # Home / root route
    @app.route('/', methods=['GET'])
    def home():
        return {
            'status': 'success',
            'message': 'CargoX Backend API is running'
        }, 200

    # Health check (no auth required — used by Render health check)
    @app.route('/health', methods=['GET'])
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return {
            'status': 'healthy',
            'message': 'CargoX API is running'
        }, 200

    return app
