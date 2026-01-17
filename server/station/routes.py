from flask import Blueprint, request, jsonify
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import supabase

station_bp = Blueprint('station', __name__, url_prefix='/station')

# SocketIO instance (set by server.py)
_socketio = None

def set_socketio(socketio):
    """Set the SocketIO instance for emitting events."""
    global _socketio
    _socketio = socketio


@station_bp.route('/enter', methods=['POST'])
def station_enter():
    """
    Station enter route - called when Viam detects a maker at a station camera.
    
    Expects JSON body:
    {
        "external_label": "6767",  # The Viam face recognition label
        "station_id": "uuid"       # The station UUID
    }
    
    On success:
    - Updates maker_status to 'active' with station_id
    - Updates station_status to 'in_use' with active_maker_id
    - Broadcasts 'station_entered' event via WebSocket
    """
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "Missing request body"}), 400
    
    external_label = data.get('external_label')
    station_id = data.get('station_id')
    
    if not external_label:
        return jsonify({"error": "Missing external_label"}), 400
    
    if not station_id:
        return jsonify({"error": "Missing station_id"}), 400
    
    if not supabase:
        return jsonify({"error": "Database connection not available"}), 500
    
    try:
        # Look up the maker by their Viam external_label
        maker_response = supabase.table('makers').select('*').eq('external_label', external_label).execute()
        
        if not maker_response.data or len(maker_response.data) == 0:
            return jsonify({"error": f"Maker with label '{external_label}' not found"}), 404
        
        maker = maker_response.data[0]
        maker_id = maker['id']
        
        # Look up the station
        station_response = supabase.table('stations').select('*').eq('id', station_id).execute()
        
        if not station_response.data or len(station_response.data) == 0:
            return jsonify({"error": f"Station with id '{station_id}' not found"}), 404
        
        station = station_response.data[0]
        
        # Update maker_status to 'active' with station_id
        supabase.table('maker_status').upsert({
            'maker_id': maker_id,
            'status': 'active',
            'station_id': station_id,
            'updated_at': 'now()'
        }, on_conflict='maker_id').execute()
        
        # Update station_status to 'in_use' with active_maker_id
        supabase.table('station_status').upsert({
            'station_id': station_id,
            'status': 'in_use',
            'active_maker_id': maker_id,
            'updated_at': 'now()'
        }, on_conflict='station_id').execute()
        
        # Prepare data for response and WebSocket broadcast
        event_data = {
            "maker": {
                "id": maker_id,
                "display_name": maker['display_name'],
                "external_label": maker['external_label'],
                "status": "active"
            },
            "station": {
                "id": station_id,
                "name": station['name'],
                "status": "in_use"
            }
        }
        
        # Broadcast to all connected WebSocket clients
        if _socketio:
            _socketio.emit('station_entered', event_data)
            print(f"WebSocket: Emitted 'station_entered' - {maker['display_name']} at {station['name']}")
        
        return jsonify({
            "success": True,
            "message": f"Maker '{maker['display_name']}' entered station '{station['name']}'",
            **event_data
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
