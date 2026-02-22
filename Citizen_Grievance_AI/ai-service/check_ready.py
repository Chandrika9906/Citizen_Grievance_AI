import sys
import os

print("\n" + "="*60)
print("  STARTING AI SERVICE TEST")
print("="*60 + "\n")

try:
    # Import all modules to check if they load
    from models.department_classifier import DepartmentClassifier
    from models.priority_predictor import PriorityPredictor
    from models.hotspot_detector import HotspotDetector
    from models.sentiment_analyzer import SentimentAnalyzer
    from models.duplicate_detector import DuplicateDetector
    from models.image_classifier import ImageClassifier
    from models.voice_processor import VoiceProcessor
    from models.trend_predictor import TrendPredictor
    
    print("[OK] All AI modules loaded successfully!")
    print("\n" + "="*60)
    print("  AI SERVICE IS READY TO START!")
    print("="*60)
    print("\nTo start the service, run:")
    print("  python app.py")
    print("\nThe service will run on: http://localhost:5001")
    print("\n")
    
except Exception as e:
    print(f"[ERROR] {e}")
    import traceback
    traceback.print_exc()
