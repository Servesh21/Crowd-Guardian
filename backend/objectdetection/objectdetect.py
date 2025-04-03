import cv2
import numpy as np
from ultralytics import YOLO
import os
import time
from datetime import datetime
import math
from backend.app.models.videodata import insert_crowd_data  # Importing the insert function
from backend.app.models.insertalertdata import insert_alert_data

# Load YOLOv8 model
model = YOLO("../Yolo-Weights/yolov8l.pt")  # Ensure correct model path

# Constants
GRID_SIZE = (3, 3)  # Splitting the frame into 3x3 sections
SAVE_ALERT_PATH = "alerts/"
LOCATION = "Gate A"

# Ensure alert directory exists
os.makedirs(SAVE_ALERT_PATH, exist_ok=True)

# Open video capture
video_path = "1.mp4"  # Path to the video file
cap = cv2.VideoCapture(video_path)

if not cap.isOpened():
    print("Error: Cannot open video file!")
    exit()

# Get video properties
frame_width = int(cap.get(3))
frame_height = int(cap.get(4))


# Estimate FOV dynamically
def get_fov_from_metadata(video_source):
    """Estimate the Field of View (FOV) dynamically for cameras or use a default value for video files."""

    if isinstance(video_source, str):  # Video file case
        print("Using default FOV for video files.")
        return 60  # Default FOV (adjust based on the actual camera)

    cap = cv2.VideoCapture(video_source)

    if not cap.isOpened():
        print("Warning: Unable to access camera. Using default FOV.")
        return 60  # Default fallback value

    # Focal length retrieval (usually returns 0 for webcams)
    focal_length_mm = cap.get(cv2.CAP_PROP_FOCAL_LENGTH)

    # Approximate sensor width (varies by camera type)
    sensor_size_mm = 6.0  # Common sensor width (adjust for known camera models)

    if focal_length_mm > 0:
        horizontal_fov = 2 * math.degrees(math.atan((sensor_size_mm / 2) / focal_length_mm))
        print(f"Calculated FOV: {horizontal_fov:.2f} degrees")
    else:
        print("Focal length not available. Using default FOV of 60 degrees.")
        horizontal_fov = 60  # Default value

    cap.release()
    return horizontal_fov


HORIZONTAL_FOV = get_fov_from_metadata(video_path)
VERTICAL_FOV = HORIZONTAL_FOV * (9 / 16)  # Assuming 16:9 aspect ratio


# Estimate Camera Height Dynamically
def estimate_camera_height(person_pixel_height, known_person_height=1.7, frame_height=1080):
    """Estimate camera height using a known object's pixel height in the frame."""
    if person_pixel_height == 0:
        return None
    estimated_height = (known_person_height * frame_height) / person_pixel_height
    return estimated_height


# Compute Real-World Area
def compute_real_world_area(camera_height, vertical_fov, horizontal_fov):
    """Compute the real-world area visible in the frame based on camera height and FOV."""
    if camera_height is None:
        return 50  # Default area if height isn't estimated

    # Approximate visible field dimensions using trigonometry
    visible_height = 2 * camera_height * math.tan(math.radians(vertical_fov / 2))
    visible_width = 2 * camera_height * math.tan(math.radians(horizontal_fov / 2))

    return visible_width * visible_height


# Track time for periodic updates
last_update_time = time.time()
density_over_time = []
occupancy_over_time = []
camera_height = None  # Dynamically update this


def handle_alert(frame, location, people_count, density_per_sqm):
    alert_filename = os.path.join(SAVE_ALERT_PATH, f"alert_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg")
    cv2.imwrite(alert_filename, frame)
    print(f"[ALERT] High crowd density detected! Image saved: {alert_filename}")

    # Determine Risk Level
    risk_level = "Low" if density_per_sqm < 2 else "Medium" if density_per_sqm < 4 else "High"

    # Store alert in the database
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

                # Estimate camera height from detected person
                if camera_height is None:
                    person_pixel_height = y2 - y1
                    camera_height = estimate_camera_height(person_pixel_height)

                # Ensure bounding box stays in frame
                x1, y1, x2, y2 = max(0, x1), max(0, y1), min(frame.shape[1], x2), min(frame.shape[0], y2)

                # Assign to grid
                grid_x = int((x1 + x2) / 2 / (frame_width / GRID_SIZE[1]))
                grid_y = int((y1 + y2) / 2 / (frame_height / GRID_SIZE[0]))
                grid_counts[min(grid_y, GRID_SIZE[0] - 1), min(grid_x, GRID_SIZE[1] - 1)] += 1

                # Draw bounding box
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(frame, "Person", (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

    # Compute real-world area dynamically
    REAL_WORLD_AREA = compute_real_world_area(camera_height, VERTICAL_FOV, HORIZONTAL_FOV)

    # Compute Density
    density_per_sqm = person_count / REAL_WORLD_AREA
    occupancy = person_count

    # Determine Risk Level
    risk_level = "Low" if density_per_sqm < 2 else "Medium" if density_per_sqm < 4 else "High"

    # Display person count & risk level
    cv2.putText(frame, f"Total People: {person_count}", (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
    cv2.putText(frame, f"Risk: {risk_level}", (20, 90), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 0), 2)

    # Check for crowd density alerts
    if risk_level == "High":
        cv2.putText(frame, "🚨 High Density Alert!", (50, 130), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 0, 255), 4)
        handle_alert(frame, LOCATION, person_count, density_per_sqm)

    # Every 30 seconds, store data
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

    # Show output frame
    cv2.imshow("Crowd Detection", frame)

    # Exit when 'q' is pressed
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
