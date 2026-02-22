"""
Retrain department classifier with expanded dataset
Run this to improve model accuracy
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from data.training_dataset import get_training_data
from models.department_classifier import DepartmentClassifier

def retrain_model():
    print("🔄 Retraining Department Classifier...")
    
    # Get training data
    texts, labels = get_training_data()
    print(f"📊 Training samples: {len(texts)}")
    
    # Count by department
    from collections import Counter
    counts = Counter(labels)
    print("\n📈 Samples per department:")
    for dept, count in counts.items():
        print(f"  {dept}: {count}")
    
    # Retrain model
    classifier = DepartmentClassifier()
    classifier.retrain(texts, labels)
    
    print("\n✅ Model retrained successfully!")
    
    # Test the model
    print("\n🧪 Testing retrained model...")
    test_cases = [
        "water leakage near my house",
        "pothole on main road",
        "garbage not collected",
        "power cut problem",
        "illegal parking"
    ]
    
    for text in test_cases:
        dept = classifier.predict(text)
        confidence = classifier.get_confidence(text)
        print(f"\n  Text: {text}")
        print(f"  Department: {dept} (Confidence: {confidence:.2%})")

if __name__ == "__main__":
    retrain_model()
