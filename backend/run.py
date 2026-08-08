import os
from app import create_app
from app.utils.auth import init_firebase
from app.extensions import socketio

app = create_app()

# Initialize Firebase (gracefully skipped if credentials not configured)
init_firebase(app)

if __name__ == '__main__':
    flask_env = os.getenv('FLASK_ENV', 'production')

    if flask_env == 'development':
        # Only auto-create tables in development
        # In production, always use: flask db upgrade
        from app.extensions import db
        with app.app_context():
            db.create_all()
            print("[DEV] Tables created via db.create_all()")

    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() in ('true', '1')

    print(f"[CargoX] Starting server on port {port}, debug={debug}")
    socketio.run(
        app,
        host='0.0.0.0',
        port=port,
        debug=debug,
        allow_unsafe_werkzeug=True
    )
