import cv2
import numpy as np
from ultralytics import YOLO
import os
import time
from datetime import datetime
from flask import Blueprint, Response
from backend.app.models.insertalertdata import insert_alert_data

detection_bp = Blueprint("detection", __name__)

# Load YOLOv8 model
model = YOLO("../Yolo-Weights/yolov8l.pt")

# Constants
GRID_SIZE = (3, 3)
SAVE_ALERT_PATH = "alerts/"
LOCATION = "Gate A"
COOLDOWN_TIME = 120
MAP_CENTER_LAT, MAP_CENTER_LON = 19.0760, 72.8777  # Example GPS coordinate for Mumbai

# Ensure alert directory exists
os.makedirs(SAVE_ALERT_PATH, exist_ok=True)


def detect_crowd():
    cap = cv2.VideoCapture('1.mp4')  # Use webcam (Change to video file if needed)

    if not cap.isOpened():
        print("Error: Cannot open video source!")
        return

    frame_width = int(cap.get(3))
    frame_height = int(cap.get(4))
    grid_width = frame_width // GRID_SIZE[1]
    grid_height = frame_height // GRID_SIZE[0]

    last_alert_times = np.zeros(GRID_SIZE, dtype=float)
    camera_height = None

    def estimate_camera_height(person_pixel_height, known_person_height=1.7, frame_height=1080):
        if person_pixel_height == 0:
            return None
        return (known_person_height * frame_height) / person_pixel_height

    def compute_real_world_area(camera_height):
        return (2 * camera_height) ** 2 if camera_height else 50

    def map_pixel_to_gps(x, y):
        lat_offset = (y / frame_height - 0.5) * 0.0005
        lon_offset = (x / frame_width - 0.5) * 0.0005
        return MAP_CENTER_LAT + lat_offset, MAP_CENTER_LON + lon_offset

    def handle_alert(frame, location, grid_x, grid_y, people_count, density_per_sqm, latitude, longitude):
        alert_filename = os.path.join(SAVE_ALERT_PATH, f"alert_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg")
        cv2.imwrite(alert_filename, frame)
        print(f"[ALERT] High crowd density detected! Image saved: {alert_filename}")

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
            break

        frame = cv2.resize(frame, (1920, 1080))
        results = model(frame, conf=0.00025)
        grid_counts = np.zeros(GRID_SIZE, dtype=int)
        person_count = 0
        current_time = time.time()

        for result in results:
            boxes = result.boxes.xyxy
            classes = result.boxes.cls

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
        risk_level = "Low" if density_per_sqm < 2 else "Medium" if density_per_sqm < 4 else "High"

        for y in range(GRID_SIZE[0]):
            for x in range(GRID_SIZE[1]):
                if grid_counts[y, x] > 5 and current_time - last_alert_times[y, x] > COOLDOWN_TIME:
                    last_alert_times[y, x] = current_time
                    latitude, longitude = map_pixel_to_gps(x * grid_width, y * grid_height)
                    handle_alert(frame, f"{LOCATION} (Grid {x},{y})", x, y, grid_counts[y, x], density_per_sqm, latitude, longitude)

                cv2.rectangle(frame, (x * grid_width, y * grid_height),
                              ((x + 1) * grid_width, (y + 1) * grid_height), (255, 0, 0), 2)
                cv2.putText(frame, f"{grid_counts[y, x]}", (x * grid_width + 10, y * grid_height + 30),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 0), 2)

        cv2.putText(frame, f"Total People: {person_count}", (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        cv2.putText(frame, f"Risk: {risk_level}", (20, 90), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 0), 2)

        _, buffer = cv2.imencode(".jpg", frame)
        yield (b"--frame\r\n"
               b"Content-Type: image/jpeg\r\n\r\n" + buffer.tobytes() + b"\r\n")

    cap.release()


@detection_bp.route("/stream", methods=["GET"])
def stream_video():
    return Response(detect_crowd(), mimetype="multipart/x-mixed-replace; boundary=frame")
