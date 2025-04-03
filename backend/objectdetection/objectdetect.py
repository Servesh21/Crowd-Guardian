import cv2
import numpy as np
from ultralytics import YOLO
import os
import time
from datetime import datetime
import json
from app.models.videodata import insert_crowd_data  # Importing the insert function
from app.models.insertalertdata import insert_alert_data

# Load YOLOv8 model
model = YOLO("../Yolo-Weights/yolov8l.pt")  # Ensure correct model path

# Constants
DENSITY_THRESHOLD = 20  # People threshold for high density
GRID_SIZE = (3, 3)  # Splitting the frame into 3x3 sections
SAVE_ALERT_PATH = "alerts/"
REAL_WORLD_AREA = 50  # Estimated area in square meters
LOCATION = "Gate A"  # Set the location for database entries


# Ensure alert directory exists
os.makedirs(SAVE_ALERT_PATH, exist_ok=True)

# Open video capture
video_path = "C:\Users\Hemant\OneDrive\Desktop\SAFECROWD MANAGER\backend\objectdetection\WhatsApp Video 2025-04-03 at 14.03.40_e59c2f05.mp4"  # Path to the video file
cap = cv2.VideoCapture(video_path)

if not cap.isOpened():
    print("Error: Cannot open video file!")
    exit()

# Get video properties
frame_width = int(cap.get(3))
frame_height = int(cap.get(4))

# Create OpenCV window
cv2.namedWindow("Crowd Detection", cv2.WINDOW_NORMAL)

# Track time for periodic updates
last_update_time = time.time()
density_over_time = []
occupancy_over_time = []

def handle_alert(frame, location, people_count, density_per_sqm):
    alert_filename = os.path.join(SAVE_ALERT_PATH, f"alert_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg")
    cv2.imwrite(alert_filename, frame)
    print(f"[ALERT] High crowd density detected! Image saved: {alert_filename}")

    # Determine Risk Level
    risk_level = "Low" if density_per_sqm < 2 else "Medium" if density_per_sqm < 4 else "High"

    # Store alert in the "alerts" table
    insert_alert_data(
        location=location,
        message="High crowd density detected!",
        image_path=alert_filename,
        people_count=people_count,
        density_per_sqm=density_per_sqm,
        risk_level=risk_level
    )



while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        print("End of video or cannot read frame.")
        break

    # Resize frame for consistency
    frame = cv2.resize(frame, (1920, 1080))

    # Run YOLOv8 inference
    results = model(frame, conf=0.00025)  # Confidence threshold

    person_count = 0
    grid_counts = np.zeros(GRID_SIZE, dtype=int)  # Grid to track people density

    for result in results:
        boxes = result.boxes.xyxy  # Bounding boxes
        classes = result.boxes.cls  # Class IDs

        for i in range(len(boxes)):
            if int(classes[i]) == 0:  # Class 0 = person
                person_count += 1
                x1, y1, x2, y2 = map(int, boxes[i])

                # Ensure bounding box stays in frame
                x1, y1, x2, y2 = max(0, x1), max(0, y1), min(frame.shape[1], x2), min(frame.shape[0], y2)

                # Find which grid cell the person belongs to
                grid_x = int((x1 + x2) / 2 / (frame_width / GRID_SIZE[1]))
                grid_y = int((y1 + y2) / 2 / (frame_height / GRID_SIZE[0]))
                grid_counts[min(grid_y, GRID_SIZE[0] - 1), min(grid_x, GRID_SIZE[1] - 1)] += 1

                # Draw bounding box
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(frame, "Person", (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

    # Compute Density
    density_per_sqm = person_count / REAL_WORLD_AREA
    occupancy = person_count  # Keeping occupancy same as person count

    # Determine Risk Level
    risk_level = "Low" if density_per_sqm < 2 else "Medium" if density_per_sqm < 4 else "High"

    # Display person count & risk level
    cv2.putText(frame, f"Total People: {person_count}", (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
    cv2.putText(frame, f"Risk: {risk_level}", (20, 90), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 0), 2)

    # Check for crowd density alerts
    if np.max(grid_counts) >= DENSITY_THRESHOLD:
        alert_message = "🚨 High Density Alert!"
        cv2.putText(frame, alert_message, (50, 130), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 0, 255), 4)

        # Save alert image
        alert_filename = os.path.join(SAVE_ALERT_PATH, f"alert_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg")
        cv2.imwrite(alert_filename, frame)
        print(f"[ALERT] High crowd density detected! Image saved: {alert_filename}")
        handle_alert(frame, LOCATION, person_count, density_per_sqm)

        # # Store alert in Supabase
        # insert_crowd_data(
        #     location=LOCATION,
        #     people_count=person_count,
        #     area_sqm=REAL_WORLD_AREA,
        #     density_over_time=density_over_time,
        #     occupancy_over_time=occupancy_over_time
        # )

    # Every 30 seconds, store data
    if time.time() - last_update_time >= 30:
        density_over_time.append(density_per_sqm)
        occupancy_over_time.append(occupancy)

        # Store in Supabase
        insert_crowd_data(
            location=LOCATION,
            people_count=person_count,
            area_sqm=REAL_WORLD_AREA,
            density_over_time=density_over_time,
            occupancy_over_time=occupancy_over_time
        )

        # Reset timer
        last_update_time = time.time()

    # Show output frame
    cv2.imshow("Crowd Detection", frame)

    # Exit when 'q' is pressed
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
