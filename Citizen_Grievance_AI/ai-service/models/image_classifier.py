from PIL import Image
import os


class ImageClassifier:
    def __init__(self):
        """
        Image classification for complaint types using YOLOv8 (Detection Adapted)
        """
        self.model = None
        self.categories = {
            0: {"name": "pothole", "department": "Road"},
            1: {"name": "garbage", "department": "Sanitation"},
            2: {"name": "water_leak", "department": "Water"},
            3: {"name": "broken_wire", "department": "Electricity"}
        }
        self.load_model()

    def load_model(self):
        """Load trained YOLOv8 model"""
        model_path = 'models/saved/yolo_complaint_classifier.pt'

        if os.path.exists(model_path):
            try:
                from ultralytics import YOLO
                self.model = YOLO(model_path)
                print("[OK] YOLOv8 complaint classifier loaded")
                print("Model task type:", self.model.task)
            except ImportError:
                print("[INFO] Ultralytics not installed.")
                self.model = None
            except Exception as e:
                print(f"[ERROR] Could not load YOLOv8 model: {e}")
                self.model = None
        else:
            print("[INFO] YOLOv8 model not found.")
            self.model = None

    def classify(self, image_file):
        try:
            # Read image
            if isinstance(image_file, str):
                image = Image.open(image_file)
            else:
                image = Image.open(image_file)

            if self.model:
                results = self.model(image)
                boxes = results[0].boxes

                if boxes is not None and len(boxes) > 0:
                    confidences = boxes.conf.tolist()
                    classes = boxes.cls.tolist()

                    max_index = confidences.index(max(confidences))
                    top_class = int(classes[max_index])
                    confidence = float(confidences[max_index])

                    category_info = self.categories.get(top_class, {
                        "name": "unknown",
                        "department": "General"
                    })

                    return {
                        "detected": category_info["name"],
                        "department": category_info["department"],
                        "confidence": round(confidence, 2),
                        "message": f"Detected {category_info['name']} with {confidence:.1%} confidence",
                        "model": "YOLOv8-detect"
                    }

                else:
                    return {
                        "detected": "none",
                        "department": "General",
                        "confidence": 0,
                        "message": "No issue detected in image",
                        "model": "YOLOv8-detect"
                    }

            else:
                return {
                    "detected": "pothole",
                    "department": "Road",
                    "confidence": 0.5,
                    "message": "Using placeholder (model not loaded)",
                    "model": "placeholder"
                }

        except Exception as e:
            return {
                "error": str(e),
                "department": "General",
                "confidence": 0,
                "message": "Error processing image"
            }

    def predict_from_path(self, image_path):
        return self.classify(image_path)

    def get_categories(self):
        return [info["name"] for info in self.categories.values()]
