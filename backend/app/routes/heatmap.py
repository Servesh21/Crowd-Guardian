from flask import Flask, Response, request
import cv2
import numpy as np
from flask_cors import CORS
from flask import Blueprint

heatmap_bp = Blueprint("heatmap", __name__)

# Video path
video_path = "1.mp4"

def generate_heatmap():
    cap = cv2.VideoCapture(video_path)
    heatmap_accumulator = None
    background_subtractor = cv2.createBackgroundSubtractorMOG2()

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.resize(frame, (640, 360))  # Resize for consistency
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (21, 21), 0)

        # Initialize heatmap accumulator
        if heatmap_accumulator is None:
            heatmap_accumulator = np.zeros_like(blurred, dtype=np.float32)

        # Accumulate heatmap values
        heatmap_accumulator = cv2.addWeighted(heatmap_accumulator, 0.8, blurred.astype(np.float32), 0.2, 0)

        # Normalize heatmap
        norm_heatmap = cv2.normalize(heatmap_accumulator, None, 0, 255, cv2.NORM_MINMAX)
        norm_heatmap = np.uint8(norm_heatmap)

        # Apply HOT colormap
        heatmap_color = cv2.applyColorMap(norm_heatmap, cv2.COLORMAP_JET)

        # Apply light smoothing to make it cleaner
        heatmap_color = cv2.GaussianBlur(heatmap_color, (5, 5), 0)

        # Motion detection for highlighting people
        fg_mask = background_subtractor.apply(gray)
        contours, _ = cv2.findContours(fg_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        # for cnt in contours:
            # if cv2.contourArea(cnt) < 10:
            #     x, y, w, h = cv2.boundingRect(cnt)
            #     cv2.rectangle(heatmap_color, (x, y), (x + w, y + h), (255, 0, 0), 2)  # Blue box

        # Encode as JPEG
        _, buffer = cv2.imencode('.jpg', heatmap_color)
        frame_bytes = buffer.tobytes()

        # Yield frame
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

    cap.release()

@heatmap_bp.route('/video_heatmap')
def video_feed():
    return Response(generate_heatmap(), mimetype='multipart/x-mixed-replace; boundary=frame')
