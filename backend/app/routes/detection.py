import cv2
import numpy as np
from flask import Blueprint, Response, jsonify, request
from ultralytics import YOLO
import os
import time
from datetime import datetime
from threading import Lock, Thread
from backend.app.models.videodata import insert_crowd_data
from backend.app.models.insertalertdata import insert_alert_data
from backend.app.routes.alerts import send_sms_alert,send_alert

# Load YOLOv8 model
model = YOLO('yolov8l.pt')
detection_bp = Blueprint("detection", __name__)

# Constants
GRID_SIZE = (3, 3)
SAVE_ALERT_PATH = "alerts/"
LOCATION = "Gate A"
COOLDOWN_TIME = 120  # 2 minutes cooldown
CROWD_UPDATE_INTERVAL = 30  # Update crowd data every 30 seconds
MAP_CENTER_LAT, MAP_CENTER_LON = 19.0760, 72.8777  # Example GPS coordinate for Mumbai

# Ensure alert directory exists
os.makedirs(SAVE_ALERT_PATH, exist_ok=True)

# Shared variables
risk_level = "Low"
risk_lock = Lock()
last_alert_times = {}  # Dictionary to store last alert times for each grid cell

# Latest grid snapshot for real-time map
grid_data_lock = Lock()
last_grid_data = None

# Background detection worker
_bg_thread: Thread | None = None

def _ensure_background_running():
    global _bg_thread
    if _bg_thread and _bg_thread.is_alive():
        print("[DEBUG] Background thread already running")
        return

    print("[DEBUG] Starting background detection thread...")
    def _runner():
        # Consume the generator to keep updating last_grid_data
        try:
            print("[DEBUG] Background runner starting detect_crowd generator")
            for frame_count, _ in enumerate(detect_crowd(None)):
                # We don't need the frame bytes here; detect_crowd updates shared state
                if frame_count % 30 == 0:  # Log every 30 frames
                    print(f"[DEBUG] Background processed {frame_count} frames")
        except Exception as e:
            print(f"[ERROR] Background detection stopped: {e}")
            import traceback
            traceback.print_exc()

    _bg_thread = Thread(target=_runner, daemon=True)
    _bg_thread.start()
    print(f"[DEBUG] Background thread started: {_bg_thread.is_alive()}")

def detect_crowd(video_override: str | None = None):
    # Open video capture
    if video_override:
        video_path = video_override
    else:
        base_dir = os.path.dirname(os.path.dirname(__file__))  # backend/app
        video_path = os.path.join(base_dir, "1.mp4")
    
    print(f"[DEBUG] Opening video: {video_path}")
    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        print(f"[ERROR] Cannot open video file: {video_path}")
        return

    frame_width = int(cap.get(3))
    frame_height = int(cap.get(4))
    print(f"[DEBUG] Video opened successfully: {frame_width}x{frame_height}")
    grid_width = frame_width // GRID_SIZE[1]
    grid_height = frame_height // GRID_SIZE[0]

    last_crowd_update_time = time.time()  # Initialize crowd data update timer
    last_update_time = time.time()
    density_over_time = []
    occupancy_over_time = []
    camera_height = None

    def estimate_camera_height(person_pixel_height, known_person_height=1.7, frame_height=1080):
        if person_pixel_height == 0:
            return None
        return (known_person_height * frame_height) / person_pixel_height

    def compute_real_world_area(camera_height):
        if camera_height is None:
            return 50  # Default area
        return (2 * camera_height) ** 2

    def map_pixel_to_gps(x, y):
        lat_offset = (y / frame_height - 0.5) * 0.0005
        lon_offset = (x / frame_width - 0.5) * 0.0005
        return MAP_CENTER_LAT + lat_offset, MAP_CENTER_LON + lon_offset

    def handle_alert(frame, location, grid_x, grid_y, people_count, density_per_sqm, latitude, longitude):
        alert_filename = os.path.join(SAVE_ALERT_PATH, f"alert_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg")
        cv2.imwrite(alert_filename, frame)
        print(f"[ALERT] High crowd density detected! Image saved: {alert_filename}")
        global risk_level
        risk_level = "Low" if density_per_sqm < 2 else "Medium" if density_per_sqm < 4 else "High"

        insert_alert_data(
            location=location,
            grid_x=grid_x,
            grid_y=grid_y,
            message="High crowd density detected!",
            image_path=alert_filename,
            people_count=int(people_count),
            density_per_sqm=float(density_per_sqm),
            risk_level=risk_level,
            latitude=latitude,
            longitude=longitude,
            timestamp=datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        )

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            print("[DEBUG] End of video, restarting...")
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)  # Restart video
            continue

        print("[DEBUG] Processing frame...")
        frame = cv2.resize(frame, (1920, 1080))
        results = model(frame, conf=0.0001)
        grid_counts = np.zeros(GRID_SIZE, dtype=int)
        person_count = 0
        current_time = time.time()

        for result in results:
            boxes = result.boxes.xyxy
            classes = result.boxes.cls
            print(f"[DEBUG] Found {len(boxes)} detections in frame")

            for i in range(len(boxes)):
                if int(classes[i]) == 0:
                    person_count += 1
                    x1, y1, x2, y2 = map(int, boxes[i])
                    person_pixel_height = y2 - y1
                    if camera_height is None:
                        camera_height = estimate_camera_height(person_pixel_height)

                    grid_x = min((x1 + x2) // 2 // grid_width, GRID_SIZE[1] - 1)
                    grid_y = min((y1 + y2) // 2 // grid_height, GRID_SIZE[0] - 1)
                    grid_counts[grid_y, grid_x] += 1

                    latitude, longitude = map_pixel_to_gps((x1 + x2) / 2, (y1 + y2) / 2)

                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    cv2.putText(frame, "Person", (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
                    cv2.putText(frame, f"Lat: {latitude:.5f}, Lon: {longitude:.5f}", (x1, y2 + 20),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)

        REAL_WORLD_AREA = compute_real_world_area(camera_height)
        density_per_sqm = person_count / REAL_WORLD_AREA
        occupancy = person_count
        print(f"[DEBUG] Frame stats - People: {person_count}, Density: {density_per_sqm:.2f}")

        new_risk = "Low" if density_per_sqm < 2 else "Medium" if density_per_sqm < 4 else "High"
        with risk_lock:
            risk_level = new_risk

        grid_area = compute_real_world_area(camera_height) / (GRID_SIZE[0] * GRID_SIZE[1])

        for y in range(GRID_SIZE[0]):
            for x in range(GRID_SIZE[1]):
                cell_key = (y, x)
                people_in_cell = grid_counts[y, x]
                cell_density = people_in_cell / grid_area if grid_area else 0

                if cell_density > 2 and (
                        cell_key not in last_alert_times or current_time - last_alert_times[cell_key] > COOLDOWN_TIME):
                    last_alert_times[cell_key] = current_time
                    latitude, longitude = map_pixel_to_gps(x * grid_width, y * grid_height)

                    handle_alert(
                        frame,
                        f"{LOCATION} (Grid {x},{y})",
                        x,
                        y,
                        people_in_cell,
                        cell_density,
                        latitude,
                        longitude
                    )

                # Draw the grid cell and display the crowd count
                cv2.rectangle(frame, (x * grid_width, y * grid_height),
                              ((x + 1) * grid_width, (y + 1) * grid_height), (255, 0, 0), 2)
                cv2.putText(frame, f"{grid_counts[y, x]}",
                            (x * grid_width + 10, y * grid_height + 30),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 0), 2)

        # Update shared grid snapshot for real-time map consumers
        with grid_data_lock:
            global last_grid_data
            last_grid_data = {
                "timestamp": datetime.now().isoformat(),
                "grid_counts": grid_counts.tolist(),
                "grid_size": {"rows": GRID_SIZE[0], "cols": GRID_SIZE[1]},
                "frame": {"width": frame_width, "height": frame_height},
                "people_count": int(person_count),
                "density_per_sqm": float(density_per_sqm),
                "risk_level": risk_level,
            }
            print(f"[DEBUG] last_grid_data SET: {last_grid_data}")

        if time.time() - last_update_time >= 30:
            density_over_time.append(density_per_sqm)
            occupancy_over_time.append(occupancy)

            insert_crowd_data(
                location=LOCATION,
                people_count=person_count,
                area_sqm=REAL_WORLD_AREA,
                density_over_time=density_over_time,
                occupancy_over_time=occupancy_over_time
            )

            last_update_time = time.time()

        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

    cap.release()

@detection_bp.route("/stream", methods=["GET"])
def stream_video():
    # Optional query param ?video=<filename> for an uploaded video in backend/app/uploads
    video_param = request.args.get("video")
    video_path = None
    if video_param:
        import os
        base_dir = os.path.dirname(os.path.dirname(__file__))
        upload_dir = os.path.join(base_dir, "uploads")
        candidate = os.path.join(upload_dir, os.path.basename(video_param))
        if os.path.isfile(candidate):
            video_path = candidate
    return Response(detect_crowd(video_path), mimetype="multipart/x-mixed-replace; boundary=frame")

@detection_bp.route("/risk-analysis", methods=["GET"])
def get_risk_analysis():
    with risk_lock:
        return jsonify({"risk_level": risk_level})


@detection_bp.route("/grid", methods=["GET"])
def get_latest_grid():
    # Returns the latest grid counts and metadata for the real-time density map
    # Ensure background detection is running so we have live snapshots even if stream isn't open
    print("[DEBUG] /grid endpoint called")
    _ensure_background_running()
    with grid_data_lock:
        global last_grid_data
        data = last_grid_data
    print(f"[DEBUG] /grid endpoint sees last_grid_data: {data}")
    if data is None:
        print("[DEBUG] No grid data available yet, returning 202")
        return jsonify({"status": "warming_up"}), 202
    # Add data_age_seconds to response
    from datetime import datetime
    try:
        ts = datetime.fromisoformat(data["timestamp"])
        age = (datetime.now() - ts).total_seconds()
    except Exception:
        age = None
    print(f"[DEBUG] Returning grid data with {data['people_count']} people, age: {age}")
    resp = dict(data)
    resp["data_age_seconds"] = age
    return jsonify(resp)
