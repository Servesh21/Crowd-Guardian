import cv2
import numpy as np
from ultralytics import YOLO
import os

# Load YOLOv8 model
model = YOLO("../Yolo-Weights/yolov8l.pt")  # Ensure the model is in the correct directory

# Thresholds
DENSITY_THRESHOLD = 20  # Number of people to trigger an alert
GRID_SIZE = (3, 3)  # Split frame into 3x3 regions for density analysis
SAVE_ALERT_PATH = "alerts/"

# Ensure alert directory exists
os.makedirs(SAVE_ALERT_PATH, exist_ok=True)

# Open video capture
video_path = "./data/3.mp4"
cap = cv2.VideoCapture(video_path)

if not cap.isOpened():
    print("Error: Cannot open video file!")
    exit()

# Get video properties
frame_width = int(cap.get(3))
frame_height = int(cap.get(4))

# Create OpenCV window
cv2.namedWindow("Crowd Detection", cv2.WINDOW_NORMAL)

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        print("End of video or cannot read frame.")
        break

    # Resize frame for consistency
    frame = cv2.resize(frame, (1920, 1080))

    # Run YOLOv8 inference
    results = model(frame, conf=0.0002)  # Confidence threshold

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

    # Display person count
    cv2.putText(frame, f"Total People: {person_count}", (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

    # Check for crowd density alerts
    if np.max(grid_counts) >= DENSITY_THRESHOLD:
        alert_message = "🚨 High Density Alert!"
        cv2.putText(frame, alert_message, (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 0, 255), 4)

        # Save alert image
        alert_filename = os.path.join(SAVE_ALERT_PATH, "alert_frame.jpg")
        cv2.imwrite(alert_filename, frame)
        print(f"[ALERT] High crowd density detected! Image saved: {alert_filename}")

    # Show output frame
    cv2.imshow("Crowd Detection", frame)

    # Exit when 'q' is pressed
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
