from app import create_app, db
from app.utils.auth import init_firebase
from app.extensions import socketio

app = create_app()

# Initialize Firebase
init_firebase(app)

if __name__ == '__main__':
    # Initialize DB (For dev/testing only)
    with app.app_context():
        # db.drop_all() # Careful with this in production
        db.create_all()
        
    socketio.run(app, host='0.0.0.0', port=5000, debug=True, allow_unsafe_werkzeug=True)
