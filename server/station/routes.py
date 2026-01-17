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
        
        # Check if station is already occupied
        station_status_response = supabase.table('station_status').select('*').eq('station_id', station_id).execute()

        if station_status_response.data and len(station_status_response.data) > 0:
            station_status = station_status_response.data[0]
            if station_status.get('in_use') == True:
                current_maker_id = station_status.get('active_maker_id')
                # Allow if it's the same maker re-entering
                if current_maker_id != maker_id:
                    return jsonify({
                        "error": f"Station '{station['name']}' is already occupied",
                        "station_id": station_id,
                        "active_maker_id": current_maker_id
                    }), 409  # 409 Conflict
        
        # Update maker_status to 'active' with station_id
        supabase.table('maker_status').upsert({
            'maker_id': maker_id,
            'status': 'active',
            'station_id': station_id,
            'updated_at': 'now()'
        }, on_conflict='maker_id').execute()
        
        # Update station_status - set in_use to True with active_maker_id
        supabase.table('station_status').upsert({
            'station_id': station_id,
            'in_use': True,
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
                "in_use": True
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


@station_bp.route('/leave', methods=['POST'])
def station_leave():
    """
    Station leave route - called when camera no longer detects a face at the station.
    
    The camera client sends a request to update the station status when no face is detected.
    
    Expects JSON body:
    {
        "station_id": "uuid"  # The station UUID (required)
    }
    
    On success:
    - Looks up who was at the station from station_status
    - Updates maker_status to 'idle' and clears station_id
    - Updates station_status: sets in_use to False and clears active_maker_id
    - Broadcasts 'station_left' event via WebSocket
    """
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "Missing request body"}), 400
    
    station_id = data.get('station_id')
    
    if not station_id:
        return jsonify({"error": "Missing station_id"}), 400
    
    if not supabase:
        return jsonify({"error": "Database connection not available"}), 500
    
    try:
        # Look up the station
        station_response = supabase.table('stations').select('*').eq('id', station_id).execute()
        
        if not station_response.data or len(station_response.data) == 0:
            return jsonify({"error": f"Station with id '{station_id}' not found"}), 404
        
        station = station_response.data[0]
        
        # Check who was at this station from station_status
        station_status_response = supabase.table('station_status').select('*').eq('station_id', station_id).execute()
        
        if not station_status_response.data or len(station_status_response.data) == 0:
            return jsonify({"error": "No status record for this station"}), 400
        
        station_status = station_status_response.data[0]
        maker_id = station_status.get('active_maker_id')
        
        # If no one was at the station, just update station status
        if not maker_id:
            # Update station_status - set in_use to False
            supabase.table('station_status').upsert({
                'station_id': station_id,
                'in_use': False,
                'active_maker_id': None,
                'updated_at': 'now()'
            }, on_conflict='station_id').execute()
            
            return jsonify({
                "success": True,
                "message": f"Station '{station['name']}' is now idle (no maker was present)",
                "station": {
                    "id": station_id,
                    "name": station['name'],
                    "in_use": False
                }
            }), 200
        
        # Get the maker details
        maker_response = supabase.table('makers').select('*').eq('id', maker_id).execute()
        
        if not maker_response.data or len(maker_response.data) == 0:
            # Maker not found, but still update station status
            supabase.table('station_status').upsert({
                'station_id': station_id,
                'in_use': False,
                'active_maker_id': None,
                'updated_at': 'now()'
            }, on_conflict='station_id').execute()
            
            return jsonify({"error": "Maker not found, but station status updated"}), 404
        
        maker = maker_response.data[0]
        
        # Update maker_status to 'idle' and clear station_id
        supabase.table('maker_status').upsert({
            'maker_id': maker_id,
            'status': 'idle',
            'station_id': None,
            'updated_at': 'now()'
        }, on_conflict='maker_id').execute()
        
        # Update station_status - set in_use to False and clear active_maker_id
        supabase.table('station_status').upsert({
            'station_id': station_id,
            'in_use': False,
            'active_maker_id': None,
            'updated_at': 'now()'
        }, on_conflict='station_id').execute()
        
        # Prepare data for response and WebSocket broadcast
        event_data = {
            "maker": {
                "id": maker_id,
                "display_name": maker['display_name'],
                "external_label": maker['external_label'],
                "status": "idle"
            },
            "station": {
                "id": station_id,
                "name": station['name'],
                "in_use": False
            }
        }
        
        # Broadcast to all connected WebSocket clients
        if _socketio:
            _socketio.emit('station_left', event_data)
            print(f"WebSocket: Emitted 'station_left' - {maker['display_name']} left {station['name']}")
        
        return jsonify({
            "success": True,
            "message": f"Maker '{maker['display_name']}' left station '{station['name']}'",
            **event_data
        }), 200
        
    except Exception as e:
        print(f"Error in station_leave: {str(e)}")
        return jsonify({"error": str(e)}), 500



















# @station_bp.route('/leave', methods=['POST'])
# def station_leave():
#     """
#     Station leave route - called when Viam no longer detects a maker at a station camera.
    
#     Expects JSON body:
#     {
#         "external_label": "6767",  # The Viam face recognition label
#         "station_id": "uuid"       # The station UUID
#     }
    
#     On success:
#     - Updates maker_status to 'idle' and clears station_id
#     - Updates station_status to 'idle' and clears active_maker_id
#     - Broadcasts 'station_left' event via WebSocket
#     """
#     data = request.get_json()
    
#     if not data:
#         return jsonify({"error": "Missing request body"}), 400
    
#     external_label = data.get('external_label')
#     station_id = data.get('station_id')
    
#     if not external_label:
#         return jsonify({"error": "Missing external_label"}), 400
    
#     if not station_id:
#         return jsonify({"error": "Missing station_id"}), 400
    
#     if not supabase:
#         return jsonify({"error": "Database connection not available"}), 500
    
#     try:
#         # Look up the maker by their Viam external_label
#         maker_response = supabase.table('makers').select('*').eq('external_label', external_label).execute()
        
#         if not maker_response.data or len(maker_response.data) == 0:
#             return jsonify({"error": f"Maker with label '{external_label}' not found"}), 404
        
#         maker = maker_response.data[0]
#         maker_id = maker['id']
        
#         # Look up the station
#         station_response = supabase.table('stations').select('*').eq('id', station_id).execute()
        
#         if not station_response.data or len(station_response.data) == 0:
#             return jsonify({"error": f"Station with id '{station_id}' not found"}), 404
        
#         station = station_response.data[0]
        
#         # Update maker_status to 'idle' and clear station_id
#         supabase.table('maker_status').upsert({
#             'maker_id': maker_id,
#             'status': 'idle',
#             'station_id': None,
#             'updated_at': 'now()'
#         }, on_conflict='maker_id').execute()
        
#         # Update station_status - set in_use to False and clear active_maker_id
#         supabase.table('station_status').upsert({
#             'station_id': station_id,
#             'in_use': False,
#             'active_maker_id': None,
#             'updated_at': 'now()'
#         }, on_conflict='station_id').execute()
        
#         # Prepare data for response and WebSocket broadcast
#         event_data = {
#             "maker": {
#                 "id": maker_id,
#                 "display_name": maker['display_name'],
#                 "external_label": maker['external_label'],
#                 "status": "idle"
#             },
#             "station": {
#                 "id": station_id,
#                 "name": station['name'],
#                 "in_use": False
#             }
#         }
        
#         # Broadcast to all connected WebSocket clients
#         if _socketio:
#             _socketio.emit('station_left', event_data)
#             print(f"WebSocket: Emitted 'station_left' - {maker['display_name']} left {station['name']}")
        
#         return jsonify({
#             "success": True,
#             "message": f"Maker '{maker['display_name']}' left station '{station['name']}'",
#             **event_data
#         }), 200
        
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500
