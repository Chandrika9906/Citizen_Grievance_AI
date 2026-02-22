from ultralytics import YOLO
import os

model_path = 'models/saved/yolo_complaint_classifier.pt'
print(f"Checking {model_path}...")
if os.path.exists(model_path):
    print("File exists.")
    try:
        model = YOLO(model_path)
        print("Model object created.")
        # Try a dummy prediction if possible
        print("Model task:", model.task)
    except Exception as e:
        print(f"Error during load: {e}")
else:
    print("File does NOT exist.")
