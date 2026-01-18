from flask import Blueprint, request, jsonify
import sys
import os
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import supabase

login_bp = Blueprint('login', __name__, url_prefix='/login')

# SocketIO instance (set by server.py)
_socketio = None

# Cooldown tracking - stores the last login time for each maker
_login_cooldowns = {}
LEAVE_COOLDOWN_SECONDS = 10

def set_socketio(socketio):
    """Set the SocketIO instance for emitting events."""
    global _socketio
    _socketio = socketio


@login_bp.route('/toggle', methods=['POST'])
def toggle():
    """
    Toggle route - automatically logs in or leaves based on current status.
    Called by Viam when a face is detected.
    
    Expects JSON body:
    {
        "external_label": "6767"  # The Viam face recognition label
    }
    
    Behavior:
    - If maker is NOT in maker_status → Check them IN (login)
    - If maker IS in maker_status → Check them OUT (leave, with 30s cooldown)
    
    Broadcasts 'maker_checked_in' or 'maker_checked_out' event via WebSocket.
    """
    
    # ============================================================
    # STEP 1: Parse and validate the request body
    # ============================================================
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "Missing request body"}), 400
    
    external_label = data.get('external_label')
    
    if not external_label:
        return jsonify({"error": "Missing external_label"}), 400
    
    if not supabase:
        return jsonify({"error": "Database connection not available"}), 500
    
    try:
        # ============================================================
        # STEP 2: Look up the maker by their Viam external_label
        # ============================================================
        maker_response = supabase.table('makers').select('*').eq('external_label', external_label).execute()
        
        if not maker_response.data or len(maker_response.data) == 0:
            return jsonify({"error": f"Maker with label '{external_label}' not found"}), 404
        
        maker = maker_response.data[0]
        maker_id = maker['id']
        
        # ============================================================
        # STEP 3: Check if maker_status exists (are they checked in?)
        # ============================================================
        status_response = supabase.table('maker_status').select('*').eq('maker_id', maker_id).execute()
        maker_is_checked_in = status_response.data and len(status_response.data) > 0
        
        if not maker_is_checked_in:
            # ============================================================
            # STEP 4A: Maker is NOT checked in → LOGIN (check them in)
            # ============================================================
            
            # Create maker_status record with 'idle' status
            supabase.table('maker_status').upsert({
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
            
            # Record login time for cooldown tracking (prevents immediate leave)
            _login_cooldowns[maker_id] = time.time()
            
            # Broadcast to all connected WebSocket clients
            if _socketio:
                _socketio.emit('maker_checked_in', maker_data)
                print(f"WebSocket: Emitted 'maker_checked_in' for {maker['display_name']}")
            
            return jsonify({
                "success": True,
                "action": "login",
                "message": f"Maker '{maker['display_name']}' checked in",
                "maker": maker_data
            }), 200
        
        else:
            # ============================================================
            # STEP 4B: Maker IS checked in → LEAVE (check them out)
            # ============================================================
            
            # Check if leave is on cooldown (30 seconds after login)
            if maker_id in _login_cooldowns:
                elapsed = time.time() - _login_cooldowns[maker_id]
                if elapsed < LEAVE_COOLDOWN_SECONDS:
                    remaining = int(LEAVE_COOLDOWN_SECONDS - elapsed)
                    return jsonify({
                        "error": f"Leave is on cooldown. Please wait {remaining} more seconds.",
                        "cooldown_remaining": remaining,
                        "action": "cooldown"
                    }), 429  # 429 = Too Many Requests
            
            # Delete the maker_status record (check them out)
            supabase.table('maker_status').delete().eq('maker_id', maker_id).execute()
            
            # Clear the cooldown after successful leave
            if maker_id in _login_cooldowns:
                del _login_cooldowns[maker_id]
            
            # Prepare maker data for response and WebSocket broadcast
            maker_data = {
                "id": maker_id,
                "display_name": maker['display_name'],
                "external_label": maker['external_label']
            }
            
            # Broadcast to all connected WebSocket clients
            if _socketio:
                _socketio.emit('maker_checked_out', maker_data)
                print(f"WebSocket: Emitted 'maker_checked_out' for {maker['display_name']}")
            
            return jsonify({
                "success": True,
                "action": "leave",
                "message": f"Maker '{maker['display_name']}' checked out",
                "maker": maker_data
            }), 200
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============================================================
# LEGACY ROUTES (commented out - kept for reference)
# ============================================================

# @login_bp.route('/', methods=['POST'])
# def login():
#     """
#     Login route for maker check-in via Viam face recognition.
#     
#     Expects JSON body:
#     {
#         "external_label": "6767"  # The Viam face recognition label
#     }
#     
#     On success, marks the maker as 'idle' (present in the makerspace).
#     Broadcasts 'maker_checked_in' event via WebSocket to all connected clients.
#     """
#     data = request.get_json()
#     
#     if not data:
#         return jsonify({"error": "Missing request body"}), 400
#     
#     external_label = data.get('external_label')
#     
#     if not external_label:
#         return jsonify({"error": "Missing external_label"}), 400
#     
#     if not supabase:
#         return jsonify({"error": "Database connection not available"}), 500
#     
#     try:
#         # Look up the maker by their Viam external_label
#         maker_response = supabase.table('makers').select('*').eq('external_label', external_label).execute()
#         
#         if not maker_response.data or len(maker_response.data) == 0:
#             return jsonify({"error": f"Maker with label '{external_label}' not found"}), 404
#         
#         maker = maker_response.data[0]
#         maker_id = maker['id']
#         
#         # Upsert into maker_status - mark them as 'idle' (present in makerspace)
#         status_response = supabase.table('maker_status').upsert({
#             'maker_id': maker_id,
#             'status': 'idle',
#             'station_id': None,
#             'updated_at': 'now()'
#         }, on_conflict='maker_id').execute()
#         
#         # Prepare maker data for response and WebSocket broadcast
#         maker_data = {
#             "id": maker_id,
#             "display_name": maker['display_name'],
#             "external_label": maker['external_label'],
#             "status": "idle"
#         }
#         
#         # Record login time for cooldown tracking
#         _login_cooldowns[maker_id] = time.time()
#         
#         # Broadcast to all connected WebSocket clients
#         if _socketio:
#             _socketio.emit('maker_checked_in', maker_data)
#             print(f"WebSocket: Emitted 'maker_checked_in' for {maker['display_name']}")
#         
#         return jsonify({
#             "success": True,
#             "message": f"Maker '{maker['display_name']}' checked in",
#             "maker": maker_data
#         }), 200
#         
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


# @login_bp.route('/leave', methods=['POST'])
# def leave():
#     """
#     Leave route for maker check-out via Viam face recognition.
#     
#     Expects JSON body:
#     {
#         "external_label": "6767"  # The Viam face recognition label
#     }
#     
#     On success, deletes the maker's status row if it exists.
#     Broadcasts 'maker_checked_out' event via WebSocket to all connected clients.
#     """
#     data = request.get_json()
#     
#     if not data:
#         return jsonify({"error": "Missing request body"}), 400
#     
#     external_label = data.get('external_label')
#     
#     if not external_label:
#         return jsonify({"error": "Missing external_label"}), 400
#     
#     if not supabase:
#         return jsonify({"error": "Database connection not available"}), 500
#     
#     try:
#         # Look up the maker by their Viam external_label
#         maker_response = supabase.table('makers').select('*').eq('external_label', external_label).execute()
#         
#         if not maker_response.data or len(maker_response.data) == 0:
#             return jsonify({"error": f"Maker with label '{external_label}' not found"}), 404
#         
#         maker = maker_response.data[0]
#         maker_id = maker['id']
#         
#         # Check if leave is on cooldown for this maker
#         if maker_id in _login_cooldowns:
#             elapsed = time.time() - _login_cooldowns[maker_id]
#             if elapsed < LEAVE_COOLDOWN_SECONDS:
#                 remaining = int(LEAVE_COOLDOWN_SECONDS - elapsed)
#                 return jsonify({
#                     "error": f"Leave is on cooldown. Please wait {remaining} more seconds.",
#                     "cooldown_remaining": remaining
#                 }), 429  # 429 = Too Many Requests
#         
#         # Check if maker_status exists for this maker
#         status_response = supabase.table('maker_status').select('*').eq('maker_id', maker_id).execute()
#         
#         if not status_response.data or len(status_response.data) == 0:
#             return jsonify({
#                 "success": False,
#                 "message": f"Maker '{maker['display_name']}' is not currently checked in"
#             }), 404
#         
#         # Maker status exists, delete it
#         delete_response = supabase.table('maker_status').delete().eq('maker_id', maker_id).execute()
#         
#         # Clear the cooldown after successful leave
#         if maker_id in _login_cooldowns:
#             del _login_cooldowns[maker_id]
#         
#         # Prepare maker data for response and WebSocket broadcast
#         maker_data = {
#             "id": maker_id,
#             "display_name": maker['display_name'],
#             "external_label": maker['external_label']
#         }
#         
#         # Broadcast to all connected WebSocket clients
#         if _socketio:
#             _socketio.emit('maker_checked_out', maker_data)
#             print(f"WebSocket: Emitted 'maker_checked_out' for {maker['display_name']}")
#         
#         return jsonify({
#             "success": True,
#             "message": f"Maker '{maker['display_name']}' checked out",
#             "maker": maker_data
#         }), 200
#         
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500
