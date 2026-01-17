from flask import Blueprint, request, jsonify
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import supabase

login_bp = Blueprint('login', __name__, url_prefix='/login')

# SocketIO instance (set by server.py)
_socketio = None

def set_socketio(socketio):
    """Set the SocketIO instance for emitting events."""
    global _socketio
    _socketio = socketio


@login_bp.route('/', methods=['POST'])
def login():
    """
    Login route for maker check-in via Viam face recognition.
    
    Expects JSON body:
    {
        "external_label": "6767"  # The Viam face recognition label
    }
    
    On success, marks the maker as 'idle' (present in the makerspace).
    Broadcasts 'maker_checked_in' event via WebSocket to all connected clients.
    """
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "Missing request body"}), 400
    
    external_label = data.get('external_label')
    
    if not external_label:
        return jsonify({"error": "Missing external_label"}), 400
    
    if not supabase:
        return jsonify({"error": "Database connection not available"}), 500
    
    try:
        # Look up the maker by their Viam external_label
        maker_response = supabase.table('makers').select('*').eq('external_label', external_label).execute()
        
        if not maker_response.data or len(maker_response.data) == 0:
            return jsonify({"error": f"Maker with label '{external_label}' not found"}), 404
        
        maker = maker_response.data[0]
        maker_id = maker['id']
        
        # Upsert into maker_status - mark them as 'idle' (present in makerspace)
        status_response = supabase.table('maker_status').upsert({
            'maker_id': maker_id,
            'status': 'idle',
            'station_id': None,
            'updated_at': 'now()'
        }, on_conflict='maker_id').execute()
        
        # Prepare maker data for response and WebSocket broadcast
        maker_data = {
            "id": maker_id,
            "display_name": maker['display_name'],
            "external_label": maker['external_label'],
            "status": "idle"
        }
        
        # Broadcast to all connected WebSocket clients
        if _socketio:
            _socketio.emit('maker_checked_in', maker_data)
            print(f"WebSocket: Emitted 'maker_checked_in' for {maker['display_name']}")
        
        return jsonify({
            "success": True,
            "message": f"Maker '{maker['display_name']}' checked in",
            "maker": maker_data
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
