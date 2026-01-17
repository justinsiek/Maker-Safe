from config import create_app
from login.routes import login_bp, set_socketio
import os
from flask_socketio import SocketIO

app = create_app()

# Initialize SocketIO with CORS support
socketio = SocketIO(app, cors_allowed_origins="*")

# Pass socketio instance to login routes
set_socketio(socketio)

app.register_blueprint(login_bp)

@app.route('/')
def index():
    """ A simple index route to confirm the server is running. """
    return "Flask server is running!"

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8080))
    print(f"Starting Flask server with WebSocket on port {port}...")
    socketio.run(app, debug=os.getenv('FLASK_DEBUG', 'True').lower() == 'true', host='localhost', port=port)