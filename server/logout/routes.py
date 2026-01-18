from flask import Blueprint, request, jsonify
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import supabase

logout_bp = Blueprint('logout', __name__, url_prefix='/logout')

# SocketIO instance (set by server.py)
_socketio = None

def set_socketio(socketio):
    """Set the SocketIO instance for emitting events."""
    global _socketio
    _socketio = socketio


@logout_bp.route('', methods=['POST'])
def logout():
    """
    Logout/Reset route - clears all operational data while preserving makers and stations.
    
    This route:
    - Deletes all records from maker_status (removes all checked-in makers)
    - Deletes all records from station_status (resets all station states)
    - Deletes all records from violations (clears violation history)
    - Preserves makers table (keeps maker profiles)
    - Preserves stations table (keeps station definitions)
    - Broadcasts 'system_reset' event via WebSocket
    """
    
    if not supabase:
        return jsonify({"error": "Database connection not available"}), 500
    
    try:
        print("Starting full system reset...")
        
        # Delete all maker_status records
        maker_status_response = supabase.table('maker_status').select('maker_id').execute()
        if maker_status_response.data:
            for ms in maker_status_response.data:
                supabase.table('maker_status').delete().eq('maker_id', ms['maker_id']).execute()
            print(f"Deleted {len(maker_status_response.data)} maker_status records")
        
        # Delete all station_status records
        station_status_response = supabase.table('station_status').select('station_id').execute()
        if station_status_response.data:
            for ss in station_status_response.data:
                supabase.table('station_status').delete().eq('station_id', ss['station_id']).execute()
            print(f"Deleted {len(station_status_response.data)} station_status records")
        
        # Delete all violations
        violations_response = supabase.table('violations').select('id').execute()
        if violations_response.data:
            for v in violations_response.data:
                supabase.table('violations').delete().eq('id', v['id']).execute()
            print(f"Deleted {len(violations_response.data)} violation records")
        
        # Broadcast system reset event
        if _socketio:
            _socketio.emit('system_reset', {
                'message': 'System has been reset'
            })
            print("WebSocket: Emitted 'system_reset'")
        
        return jsonify({
            "success": True,
            "message": "System reset successfully. All maker statuses, station statuses, and violations cleared.",
            "reset_type": "full_system",
            "details": {
                "maker_status_cleared": True,
                "station_status_cleared": True,
                "violations_cleared": True,
                "makers_preserved": True,
                "stations_preserved": True
            }
        }), 200
        
    except Exception as e:
        print(f"Error during logout/reset: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500