import os
import time
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename

videos_bp = Blueprint("videos", __name__)

ALLOWED_EXTENSIONS = {"mp4", "avi", "mov", "mkv", "webm"}


def get_upload_folder():
    # Place uploads under backend/app/uploads
    base_dir = os.path.dirname(os.path.dirname(__file__))
    upload_dir = os.path.join(base_dir, "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    return upload_dir


def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@videos_bp.route("/upload", methods=["POST"])
def upload_videos():
    if "videos" not in request.files:
        return jsonify({"error": "No files part 'videos' in the request"}), 400

    files = request.files.getlist("videos")
    if not files:
        return jsonify({"error": "No files provided"}), 400

    saved = []
    upload_dir = get_upload_folder()

    for file in files:
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            # Add a timestamp to avoid collisions
            name, ext = os.path.splitext(filename)
            stamped = f"{name}_{int(time.time())}{ext}"
            dest = os.path.join(upload_dir, stamped)
            file.save(dest)
            saved.append({"filename": stamped})
        else:
            return jsonify({"error": f"File type not allowed: {file.filename}"}), 400

    return jsonify({"status": "success", "files": saved}), 201


@videos_bp.route("/list", methods=["GET"])
def list_videos():
    upload_dir = get_upload_folder()
    try:
        files = [f for f in os.listdir(upload_dir) if os.path.isfile(os.path.join(upload_dir, f))]
        # Filter allowed only
        files = [f for f in files if allowed_file(f)]
        # Sort by modified time desc
        files.sort(key=lambda f: os.path.getmtime(os.path.join(upload_dir, f)), reverse=True)
        return jsonify({"status": "success", "files": files})
    except FileNotFoundError:
        return jsonify({"status": "success", "files": []})
