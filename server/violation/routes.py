from flask import Blueprint, request, jsonify
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import supabase

violation_bp = Blueprint('violation', __name__, url_prefix='/violation')

# SocketIO instance (set by server.py)
_socketio = None

def set_socketio(socketio):
    """Set the SocketIO instance for emitting events."""
    global _socketio
    _socketio = socketio


@violation_bp.route('/', methods=['POST'])
def create_violation():
    """
    Create a violation - called when Viam detects a safety violation (e.g., no goggles).
    
    The station camera already knows which station it is, and we look up who's 
    currently at that station from station_status.
    
    Expects JSON body:
    {
        "station_id": "uuid",               # The station UUID (camera knows this)
        "violation_type": "GOGGLES_NOT_WORN", # Type of violation
        "image_url": "optional_url"         # Optional snapshot URL
    }
    
    On success:
    - Creates a violation record in the violations table
    - Updates maker_status to 'violation'
    - Updates station_status to 'violation'
    - Broadcasts 'violation_detected' event via WebSocket
    """
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "Missing request body"}), 400
    
    station_id = data.get('station_id')
    violation_type = data.get('violation_type')
    image_url = data.get('image_url')  # Optional
    
    if not station_id:
        return jsonify({"error": "Missing station_id"}), 400
    
    if not violation_type:
        return jsonify({"error": "Missing violation_type"}), 400
    
    if not supabase:
        return jsonify({"error": "Database connection not available"}), 500
    
    try:
        # Look up the station
        station_response = supabase.table('stations').select('*').eq('id', station_id).execute()
        
        if not station_response.data or len(station_response.data) == 0:
            return jsonify({"error": f"Station with id '{station_id}' not found"}), 404
        
        station = station_response.data[0]
        
        # Look up who's currently at this station from station_status
        station_status_response = supabase.table('station_status').select('*').eq('station_id', station_id).execute()
        
        if not station_status_response.data or len(station_status_response.data) == 0:
            return jsonify({"error": "No one is currently at this station"}), 400
        
        station_status = station_status_response.data[0]
        maker_id = station_status.get('active_maker_id')
        
        if not maker_id:
            return jsonify({"error": "No active maker at this station"}), 400
        
        # Get the maker details
        maker_response = supabase.table('makers').select('*').eq('id', maker_id).execute()
        
        if not maker_response.data or len(maker_response.data) == 0:
            return jsonify({"error": "Maker not found"}), 404
        
        maker = maker_response.data[0]
        
        # Check if there's already an active (unresolved) violation for this station
        # to avoid duplicate violations while already in violation state
        existing_violation = supabase.table('violations').select('*').eq(
            'station_id', station_id
        ).is_(
            'resolved_at', 'null'
        ).execute()
        
        if existing_violation.data and len(existing_violation.data) > 0:
            return jsonify({
                "success": False,
                "message": "Violation already active at this station",
                "existing_violation_id": existing_violation.data[0]['id']
            }), 409  # Conflict
        
        # Create the violation record
        violation_data = {
            'maker_id': maker_id,
            'station_id': station_id,
            'violation_type': violation_type
        }
        if image_url:
            violation_data['image_url'] = image_url
            
        violation_response = supabase.table('violations').insert(violation_data).execute()
        violation = violation_response.data[0]
        
        # Update maker_status to 'violation'
        supabase.table('maker_status').upsert({
            'maker_id': maker_id,
            'status': 'violation',
            'station_id': station_id,
            'updated_at': 'now()'
        }, on_conflict='maker_id').execute()
        
        # Update station_status to 'violation'
        supabase.table('station_status').upsert({
            'station_id': station_id,
            'status': 'violation',
            'active_maker_id': maker_id,
            'updated_at': 'now()'
        }, on_conflict='station_id').execute()
        
        # Prepare data for response and WebSocket broadcast
        event_data = {
            "violation": {
                "id": violation['id'],
                "violation_type": violation_type,
                "image_url": image_url,
                "created_at": violation['created_at']
            },
            "maker": {
                "id": maker_id,
                "display_name": maker['display_name'],
                "external_label": maker['external_label'],
                "status": "violation"
            },
            "station": {
                "id": station_id,
                "name": station['name'],
                "status": "violation"
            }
        }
        
        # Broadcast to all connected WebSocket clients
        if _socketio:
            _socketio.emit('violation_detected', event_data)
            print(f"WebSocket: Emitted 'violation_detected' - {maker['display_name']} at {station['name']}: {violation_type}")
        
        return jsonify({
            "success": True,
            "message": f"Violation '{violation_type}' recorded for {maker['display_name']} at {station['name']}",
            **event_data
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
