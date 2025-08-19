from flask import Blueprint, jsonify
from supabase import create_client, Client
from ..config import SUPABASE_URL, SUPABASE_API_KEY

# Create a Blueprint for crowd data routes
crowd_bp = Blueprint("crowd", __name__)
# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_API_KEY)


@crowd_bp.route("/crowd_data", methods=["GET"])
def get_crowd_data():
    try:
        response = (
            supabase.table("crowd_data")
            .select("*")
            .execute()  # Explicitly pass API key
        )

        print(response)
        if response.data:
            return jsonify({"status": "success", "data": response.data}), 200
        else:
            return jsonify({"status": "success", "data": []}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": f"Error fetching crowd data: {str(e)}"}), 500
