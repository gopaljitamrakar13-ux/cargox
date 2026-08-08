from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_socketio import SocketIO

# Initialize Flask extensions (without app — configured in create_app)
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
bcrypt = Bcrypt()

# SocketIO: cors_allowed_origins is overridden in create_app via socketio.init_app()
socketio = SocketIO()
