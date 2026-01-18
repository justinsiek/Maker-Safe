from config import create_app, supabase
from login.routes import login_bp, set_socketio as set_login_socketio
from station.routes import station_bp, set_socketio as set_station_socketio
from violation.routes import violation_bp, set_socketio as set_violation_socketio
from logout.routes import logout_bp, set_socketio as set_logout_socketio
import os
from flask import jsonify
from flask_socketio import SocketIO

app = create_app()

# Initialize SocketIO with CORS support
socketio = SocketIO(app, cors_allowed_origins="*")

# Pass socketio instance to route modules
set_login_socketio(socketio)
set_station_socketio(socketio)
set_violation_socketio(socketio)
set_logout_socketio(socketio)

app.register_blueprint(login_bp)
app.register_blueprint(station_bp)
app.register_blueprint(violation_bp)
app.register_blueprint(logout_bp)

@app.route('/')
def index():
    """ A simple index route to confirm the server is running. """
    return "Flask server is running!"


@app.route('/state')
def get_state():
    """
    Get the current state of the makerspace.
    Returns all present makers, station statuses, and active violations.
    """
    if not supabase:
        return jsonify({"error": "Database connection not available"}), 500
    
    try:
        # Get all present makers (those with a maker_status entry)
        maker_status_response = supabase.table('maker_status').select(
            '*, makers(*)'
        ).execute()
        
        makers = []
        for ms in maker_status_response.data or []:
            maker_info = ms.get('makers', {})
            makers.append({
                "id": ms['maker_id'],
                "display_name": maker_info.get('display_name'),
                "external_label": maker_info.get('external_label'),
                "status": ms['status'],
                "station_id": ms.get('station_id'),
                "updated_at": ms['updated_at']
            })
        
        # Get all station statuses
        station_status_response = supabase.table('station_status').select(
            '*, stations(*)'
        ).execute()
        
        stations = []
        for ss in station_status_response.data or []:
            station_info = ss.get('stations', {})
            stations.append({
                "id": ss['station_id'],
                "name": station_info.get('name'),
                
                "active_maker_id": ss.get('active_maker_id'),
                "updated_at": ss['updated_at']
            })
        
        # Get all active (unresolved) violations
        violations_response = supabase.table('violations').select(
            '*, makers(*), stations(*)'
        ).is_('resolved_at', 'null').order('created_at', desc=True).execute()
        
        violations = []
        for v in violations_response.data or []:
            maker_info = v.get('makers', {})
            station_info = v.get('stations', {})
            violations.append({
                "id": v['id'],
                "maker_id": v['maker_id'],
                "maker_name": maker_info.get('display_name'),
                "station_id": v['station_id'],
                "station_name": station_info.get('name'),
                "violation_type": v['violation_type'],
                "image_url": v.get('image_url'),
                "created_at": v['created_at']
            })
        
        return jsonify({
            "makers": makers,
            "stations": stations,
            "violations": violations
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')
 
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8080))
    print(f"Starting Flask server with WebSocket on port {port}...")
    socketio.run(app, debug=os.getenv('FLASK_DEBUG', 'True').lower() == 'true', host='0.0.0.0', port=port)