import cv2
import torch
from ultralytics import YOLO

# Load YOLOv8 model
model = YOLO("../Yolo-Weights/yolov8l.pt")

# Open video capture
video_path = "./data/3.mp4"
cap = cv2.VideoCapture(video_path)

if not cap.isOpened():
    print("Error: Cannot open video file!")
    exit()

# Create a resizable OpenCV window
cv2.namedWindow("Crowd Detection", cv2.WINDOW_NORMAL)

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        print("End of video or cannot read frame.")
        break

    # Resize frame to standard size (1280x720)
    frame = cv2.resize(frame, (1920, 1080))

    # Run YOLOv8 inference
    results = model(frame,conf=0.000001)
    person_count = 0

    for result in results:
        boxes = result.boxes.xyxy  # Bounding boxes
        classes = result.boxes.cls  # Class IDs

        for i in range(len(boxes)):
            if int(classes[i]) == 0:  # Class 0 = person
                person_count += 1
                x1, y1, x2, y2 = map(int, boxes[i])

                # Ensure boxes stay within frame
                x1, y1, x2, y2 = max(0, x1), max(0, y1), min(frame.shape[1], x2), min(frame.shape[0], y2)

                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(frame, "Person", (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

    # Display person count
    cv2.putText(frame, f"People Count: {person_count}", (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

    # Show output frame
    cv2.imshow("Crowd Detection", frame)

    # Exit when 'q' is pressed
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
