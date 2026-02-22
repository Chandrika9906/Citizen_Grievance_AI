import os
import sys

try:
    from ultralytics import YOLO
    model_path = 'models/saved/yolo_complaint_classifier.pt'
    if os.path.exists(model_path):
        print(f"Loading model from {model_path}...")
        model = YOLO(model_path)
        print("Model loaded successfully!")
        print("Task:", model.task)
    else:
        print(f"Model file not found at {model_path}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
