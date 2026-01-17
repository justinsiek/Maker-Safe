from flask import Blueprint, request, jsonify
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import supabase

login_bp = Blueprint('login', __name__, url_prefix='/login')


@login_bp.route('/', methods=['POST'])
def login():
    """
    Login route for maker check-in via Viam face recognition.
    
    Expects JSON body:
    {
        "external_label": "6767"  # The Viam face recognition label
    }
    
    On success, marks the maker as 'idle' (present in the makerspace).
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
        
        return jsonify({
            "success": True,
            "message": f"Maker '{maker['display_name']}' checked in",
            "maker": {
                "id": maker_id,
                "display_name": maker['display_name'],
                "external_label": maker['external_label'],
                "status": "idle"
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
