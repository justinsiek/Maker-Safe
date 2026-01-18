from flask import Blueprint, request, jsonify
from threading import Timer
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


@violation_bp.route('/create', methods=['POST'])
def create_violation():
    """
    Create a violation - called when a station detects a safety violation.
    
    Expects JSON body:
    {
        "station_id": "uuid",                    # The station UUID (required)
        "violation_type": "GOGGLES_NOT_WORN",   # Type of violation (required)
        "image_url": "optional_url"             # Optional snapshot URL
    }
    
    Flow:
    1. Validate station_id and violation_type
    2. Look up which maker is currently at the station
    3. Create violation record with maker_id, station_id, violation_type, and image_url
    4. Update maker_status to 'violation'
    5. Broadcast 'violation_detected' event via WebSocket
    """
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "Missing request body"}), 400
    
    station_id = data.get('station_id')
    violation_type = data.get('violation_type')
    image_url = data.get('image_url')  # Optional
    
    # Validate required fields
    if not station_id:
        return jsonify({"error": "Missing station_id"}), 400
    
    if not violation_type:
        return jsonify({"error": "Missing violation_type"}), 400
    
    if not supabase:
        return jsonify({"error": "Database connection not available"}), 500
    
    try:
        # 1. Look up the station
        station_response = supabase.table('stations').select('*').eq('id', station_id).execute()
        
        if not station_response.data or len(station_response.data) == 0:
            return jsonify({"error": f"Station with id '{station_id}' not found"}), 404
        
        station = station_response.data[0]
        
        # 2. Check who's currently at this station from station_status
        station_status_response = supabase.table('station_status').select('*').eq('station_id', station_id).execute()
        
        if not station_status_response.data or len(station_status_response.data) == 0:
            return jsonify({"error": "No status record for this station"}), 400
        
        station_status = station_status_response.data[0]
        
        # Check if station is in use
        if not station_status.get('in_use'):
            return jsonify({"error": "Station is not currently in use"}), 400
        
        maker_id = station_status.get('active_maker_id')
        
        if not maker_id:
            return jsonify({"error": "No active maker at this station"}), 400
        
        # 3. Get the maker details
        maker_response = supabase.table('makers').select('*').eq('id', maker_id).execute()
        
        if not maker_response.data or len(maker_response.data) == 0:
            return jsonify({"error": "Maker not found"}), 404
        
        maker = maker_response.data[0]
        
        # # 4. Check if there's already an active (unresolved) violation for this maker at this station
        # # to avoid duplicate violations
        # existing_violation = supabase.table('violations').select('*').eq(
        #     'maker_id', maker_id
        # ).eq(
        #     'station_id', station_id
        # ).is_(
        #     'resolved_at', 'null'
        # ).execute()
        
        # if existing_violation.data and len(existing_violation.data) > 0:
        #     return jsonify({
        #         "success": False,
        #         "message": "Violation already active for this maker at this station",
        #         "existing_violation_id": existing_violation.data[0]['id']
        #     }), 409  # Conflict
        
        # 5. Create the violation record
        violation_data = {
            'maker_id': maker_id,
            'station_id': station_id,
            'violation_type': violation_type
        }
        if image_url:
            violation_data['image_url'] = image_url
            
        violation_response = supabase.table('violations').insert(violation_data).execute()
        violation = violation_response.data[0]
        
        # 6. Update maker_status to 'violation'
        supabase.table('maker_status').upsert({
            'maker_id': maker_id,
            'status': 'violation',
            'station_id': station_id,
            'updated_at': 'now()'
        }, on_conflict='maker_id').execute()

        # 7. Schedule status reset after 15 seconds
        def reset_maker_status():
            try:
                # Reset maker status back to 'active'
                supabase.table('maker_status').upsert({
                    'maker_id': maker_id,
                    'status': 'active',
                    'station_id': station_id,
                    'updated_at': 'now()'
                }, on_conflict='maker_id').execute()
                
                print(f"Maker status reset to 'active' after violation for {maker['display_name']}")
                
                # Emit event to notify frontend
                if _socketio:
                    _socketio.emit('maker_status_updated', {
                        'id': maker_id,
                        'status': 'active',
                        'display_name': maker['display_name']
                    })
            except Exception as e:
                print(f"Error resetting maker status: {str(e)}")
                
        # Schedule the reset for 15 seconds from now
        timer = Timer(15.0, reset_maker_status)
        timer.daemon = True
        timer.start()
        
        # 8. Prepare data for response and WebSocket broadcast
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
                "in_use": True
            }
        }
        
        # 9. Broadcast to all connected WebSocket clients
        if _socketio:
            _socketio.emit('violation_detected', event_data)
            print(f"WebSocket: Emitted 'violation_detected' - {maker['display_name']} at {station['name']}: {violation_type}")
        
        return jsonify({
            "success": True,
            "message": f"Violation '{violation_type}' recorded for {maker['display_name']} at {station['name']}",
            **event_data
        }), 201
        
    except Exception as e:
        print(f"Error creating violation: {str(e)}")
        return jsonify({"error": str(e)}), 500

























# from flask import Blueprint, request, jsonify
# import sys
# import os
# sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# from config import supabase

# violation_bp = Blueprint('violation', __name__, url_prefix='/violation')

# # SocketIO instance (set by server.py)
# _socketio = None

# def set_socketio(socketio):
#     """Set the SocketIO instance for emitting events."""
#     global _socketio
#     _socketio = socketio


# @violation_bp.route('/', methods=['POST'])
# def create_violation():
#     """
#     Create a violation - called when Viam detects a safety violation (e.g., no goggles).
    
#     The station camera already knows which station it is, and we look up who's 
#     currently at that station from station_status.
    
#     Expects JSON body:
#     {
#         "station_id": "uuid",               # The station UUID (camera knows this)
#         "violation_type": "GOGGLES_NOT_WORN", # Type of violation
#         "image_url": "optional_url"         # Optional snapshot URL
#     }
    
#     On success:
#     - Creates a violation record in the violations table
#     - Updates maker_status to 'violation'
#     - Updates station_status to 'violation'
#     - Broadcasts 'violation_detected' event via WebSocket
#     """
#     data = request.get_json()
    
#     if not data:
#         return jsonify({"error": "Missing request body"}), 400
    
#     station_id = data.get('station_id')
#     violation_type = data.get('violation_type')
#     image_url = data.get('image_url')  # Optional
    
#     if not station_id:
#         return jsonify({"error": "Missing station_id"}), 400
    
#     if not violation_type:
#         return jsonify({"error": "Missing violation_type"}), 400
    
#     if not supabase:
#         return jsonify({"error": "Database connection not available"}), 500
    
#     try:
#         # Look up the station
#         station_response = supabase.table('stations').select('*').eq('id', station_id).execute()
        
#         if not station_response.data or len(station_response.data) == 0:
#             return jsonify({"error": f"Station with id '{station_id}' not found"}), 404
        
#         station = station_response.data[0]
                
#         # Look up who's currently at this station from station_status
#         station_status_response = supabase.table('station_status').select('*').eq('station_id', station_id).execute()

#         if not station_status_response.data or len(station_status_response.data) == 0:
#             return jsonify({"error": "No one is currently at this station"}), 400

#         station_status = station_status_response.data[0]

#         # Check if station is in use
#         if not station_status.get('in_use'):
#             return jsonify({"error": "Station is not currently in use"}), 400

#         maker_id = station_status.get('active_maker_id')
        
#         # Get the maker details
#         maker_response = supabase.table('makers').select('*').eq('id', maker_id).execute()
        
#         if not maker_response.data or len(maker_response.data) == 0:
#             return jsonify({"error": "Maker not found"}), 404
        
#         maker = maker_response.data[0]
        
#         # Check if there's already an active (unresolved) violation for this station
#         # to avoid duplicate violations while already in violation state
#         existing_violation = supabase.table('violations').select('*').eq(
#             'station_id', station_id
#         ).is_(
#             'resolved_at', 'null'
#         ).execute()
        
#         if existing_violation.data and len(existing_violation.data) > 0:
#             return jsonify({
#                 "success": False,
#                 "message": "Violation already active at this station",
#                 "existing_violation_id": existing_violation.data[0]['id']
#             }), 409  # Conflict
        
#         # Create the violation record
#         violation_data = {
#             'maker_id': maker_id,
#             'station_id': station_id,
#             'violation_type': violation_type
#         }
#         if image_url:
#             violation_data['image_url'] = image_url
            
#         violation_response = supabase.table('violations').insert(violation_data).execute()
#         violation = violation_response.data[0]
        
#         # Update maker_status to 'violation'
#         supabase.table('maker_status').upsert({
#             'maker_id': maker_id,
#             'in_use': True,
#             'station_id': station_id,
#             'updated_at': 'now()'
#         }, on_conflict='maker_id').execute()
        
#         # Update station_status to 'violation'
#         supabase.table('station_status').upsert({
#             'station_id': station_id,
#             'in_use': True,
#             'active_maker_id': maker_id,
#             'updated_at': 'now()'
#         }, on_conflict='station_id').execute()
        
#         # Prepare data for response and WebSocket broadcast
#         event_data = {
#             "violation": {
#                 "id": violation['id'],
#                 "violation_type": violation_type,
#                 "image_url": image_url,
#                 "created_at": violation['created_at']
#             },
#             "maker": {
#                 "id": maker_id,
#                 "display_name": maker['display_name'],
#                 "external_label": maker['external_label'],
#                 "status": "violation"
#             },
#             "station": {
#                 "id": station_id,
#                 "name": station['name'],
#                 "in_use": True
#             }
#         }
        
#         # Broadcast to all connected WebSocket clients
#         if _socketio:
#             _socketio.emit('violation_detected', event_data)
#             print(f"WebSocket: Emitted 'violation_detected' - {maker['display_name']} at {station['name']}: {violation_type}")
        
#         return jsonify({
#             "success": True,
#             "message": f"Violation '{violation_type}' recorded for {maker['display_name']} at {station['name']}",
#             **event_data
#         }), 201
        
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


# @violation_bp.route('/resolve', methods=['POST'])
# def resolve_violation():
#     """
#     Resolve a violation - called when the safety issue is corrected (e.g., goggles now worn).
    
#     The station camera knows which station it is, and we look up the active violation.
    
#     Expects JSON body:
#     {
#         "station_id": "uuid"  # The station UUID
#     }
    
#     On success:
#     - Marks the violation as resolved (sets resolved_at)
#     - Updates maker_status back to 'active'
#     - Updates station_status back to 'in_use'
#     - Broadcasts 'violation_resolved' event via WebSocket
#     """
#     data = request.get_json()
    
#     if not data:
#         return jsonify({"error": "Missing request body"}), 400
    
#     station_id = data.get('station_id')
    
#     if not station_id:
#         return jsonify({"error": "Missing station_id"}), 400
    
#     if not supabase:
#         return jsonify({"error": "Database connection not available"}), 500
    
#     try:
#         # Look up the station
#         station_response = supabase.table('stations').select('*').eq('id', station_id).execute()
        
#         if not station_response.data or len(station_response.data) == 0:
#             return jsonify({"error": f"Station with id '{station_id}' not found"}), 404
        
#         station = station_response.data[0]
        
#         # Find the active violation at this station
#         violation_response = supabase.table('violations').select('*').eq(
#             'station_id', station_id
#         ).is_(
#             'resolved_at', 'null'
#         ).execute()
        
#         if not violation_response.data or len(violation_response.data) == 0:
#             return jsonify({"error": "No active violation found at this station"}), 404
        
#         violation = violation_response.data[0]
#         maker_id = violation['maker_id']
        
#         # Get the maker details
#         maker_response = supabase.table('makers').select('*').eq('id', maker_id).execute()
        
#         if not maker_response.data or len(maker_response.data) == 0:
#             return jsonify({"error": "Maker not found"}), 404
        
#         maker = maker_response.data[0]
        
#         # Mark violation as resolved
#         supabase.table('violations').update({
#             'resolved_at': 'now()'
#         }).eq('id', violation['id']).execute()
        
#         # Update maker_status back to 'active'
#         supabase.table('maker_status').upsert({
#             'maker_id': maker_id,
#             'status': 'active',
#             'station_id': station_id,
#             'updated_at': 'now()'
#         }, on_conflict='maker_id').execute()
        
#         # Update station_status back to 'in_use'
#         supabase.table('station_status').upsert({
#             'station_id': station_id,
#             'status': 'in_use',
#             'active_maker_id': maker_id,
#             'updated_at': 'now()'
#         }, on_conflict='station_id').execute()
        
#         # Prepare data for response and WebSocket broadcast
#         event_data = {
#             "violation": {
#                 "id": violation['id'],
#                 "violation_type": violation['violation_type'],
#                 "resolved": True
#             },
#             "maker": {
#                 "id": maker_id,
#                 "display_name": maker['display_name'],
#                 "external_label": maker['external_label'],
#                 "status": "active"
#             },
#             "station": {
#                 "id": station_id,
#                 "name": station['name'],
#                 "status": "in_use"
#             }
#         }
        
#         # Broadcast to all connected WebSocket clients
#         if _socketio:
#             _socketio.emit('violation_resolved', event_data)
#             print(f"WebSocket: Emitted 'violation_resolved' - {maker['display_name']} at {station['name']}")
        
#         return jsonify({
#             "success": True,
#             "message": f"Violation resolved for {maker['display_name']} at {station['name']}",
#             **event_data
#         }), 200
        
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500
