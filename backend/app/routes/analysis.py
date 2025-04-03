from fastapi import APIRouter, UploadFile, File
import os
from PIL import Image
import cv2
from ..models.crowd_detection import detect_crowd
from ..models.congestion_predictor import predict_congestion

router = APIRouter()

# Temporary file save directory
TEMP_DIR = "temp_files/"

# Ensure the temporary directory exists
os.makedirs(TEMP_DIR, exist_ok=True)

@router.post("/analyze")
async def analyze_crowd(file: UploadFile = File(...), is_video: bool = False):
    file_path = os.path.join(TEMP_DIR, file.filename)

    # Save the uploaded file temporarily
    with open(file_path, "wb") as f:
        f.write(await file.read())

    if is_video:
        # If the file is a video, process it frame by frame
        video = cv2.VideoCapture(file_path)
        frame_count = 0
        while True:
            ret, frame = video.read()
            if not ret:
                break

            frame_count += 1
            # Process the frame (can handle it differently if needed)
            crowd_data = detect_crowd(frame)

            # Predict congestion for this frame
            congestion = predict_congestion(crowd_data)
            
            # You can return results for every frame or aggregate them (e.g., average congestion)
            # For this example, we're returning just the results from the last frame
            if frame_count == video.get(cv2.CAP_PROP_FRAME_COUNT):  # Process last frame
                return {"frame_number": frame_count, "crowd_data": crowd_data, "predicted_congestion": congestion}

        video.release()

    else:
        # If the file is an image, process it directly
        image = Image.open(file_path)
        crowd_data = detect_crowd(image)

        # Predict congestion from the image data
        congestion = predict_congestion(crowd_data)

        return {"crowd_data": crowd_data, "predicted_congestion": congestion}
