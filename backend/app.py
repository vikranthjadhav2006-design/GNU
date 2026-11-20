import os
from uuid import UUID

from dotenv import load_dotenv
from flask import Flask, jsonify
from postgrest import APIError
from supabase import Client, create_client

load_dotenv()

app = Flask(__name__)

supabase_url = os.environ.get("SUPABASE_URL")
supabase_publishable_key = os.environ.get("SUPABASE_PUBLISHABLE_KEY")

if not supabase_url or not supabase_publishable_key:
    raise RuntimeError(
        "SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY must be configured"
    )

supabase: Client = create_client(
    supabase_url,
    supabase_publishable_key,
)


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response


@app.route("/")
def index():
    return jsonify({"message": "Events API is running"})


@app.get("/api/events")
def list_events():
    try:
        response = (
            supabase.table("events")
            .select("id, title, capacity, status")
            .execute()
        )
    except APIError:
        app.logger.exception("Supabase error while listing events")
        return jsonify({"error": "Unable to retrieve events"}), 502

    return jsonify({"events": response.data})


@app.get("/api/events/<event_id>")
def get_event(event_id):
    try:
        normalized_event_id = str(UUID(event_id))
    except ValueError:
        return jsonify({"error": "Invalid event id"}), 400

    try:
        response = (
            supabase.table("events")
            .select("id, title, capacity, status")
            .eq("id", normalized_event_id)
            .limit(1)
            .execute()
        )
    except APIError:
        app.logger.exception("Supabase error while retrieving event")
        return jsonify({"error": "Unable to retrieve event"}), 502

    if not response.data:
        return jsonify({"error": "Event not found"}), 404

    return jsonify({"event": response.data[0]})


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", "5000")),
        debug=False,
    )
