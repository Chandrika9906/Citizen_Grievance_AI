"""
Test all AI features independently
Run this to test without backend/frontend
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.department_classifier import DepartmentClassifier
from models.priority_predictor import PriorityPredictor
from models.hotspot_detector import HotspotDetector
from models.sentiment_analyzer import SentimentAnalyzer
from models.duplicate_detector import DuplicateDetector

def test_department_classifier():
    print("\n" + "="*50)
    print("TASK 1: DEPARTMENT CLASSIFICATION TEST")
    print("="*50)
    
    classifier = DepartmentClassifier()
    
    test_cases = [
        "Water leakage near bus stand",
        "Big pothole on main road",
        "Garbage not collected for 3 days",
        "Power cut since morning",
        "Illegal parking in residential area"
    ]
    
    for text in test_cases:
        dept = classifier.predict(text)
        confidence = classifier.get_confidence(text)
        print(f"\n📝 Text: {text}")
        print(f"🏢 Department: {dept}")
        print(f"✅ Confidence: {confidence:.2%}")

def test_priority_predictor():
    print("\n" + "="*50)
    print("TASK 2: PRIORITY PREDICTION TEST")
    print("="*50)
    
    predictor = PriorityPredictor()
    
    test_cases = [
        "Water leakage near bus stand",
        "URGENT! Children at risk due to open manhole",
        "Garbage not collected, please look into it",
        "EMERGENCY! Fire hazard due to broken electric wire"
    ]
    
    for text in test_cases:
        priority = predictor.predict(text)
        reason = predictor.get_reason()
        print(f"\n📝 Text: {text}")
        print(f"⚡ Priority: {priority}")
        print(f"💡 Reason: {reason}")

def test_hotspot_detector():
    print("\n" + "="*50)
    print("TASK 3: HOTSPOT DETECTION TEST")
    print("="*50)
    
    detector = HotspotDetector()
    
    # Simulate complaints in same area
    test_location = (28.6139, 77.2090)  # Delhi coordinates
    
    print(f"\n📍 Testing location: {test_location}")
    
    for i in range(5):
        result = detector.check_hotspot(test_location[0], test_location[1])
        print(f"\nComplaint #{i+1}:")
        print(f"🔥 Is Hotspot: {result['is_hotspot']}")
        print(f"📊 Nearby Count: {result['nearby_count']}")
        print(f"⬆️ Priority Boost: {result['priority_boost']}")

def test_sentiment_analyzer():
    print("\n" + "="*50)
    print("TASK 6: SENTIMENT ANALYSIS TEST")
    print("="*50)
    
    analyzer = SentimentAnalyzer()
    
    test_cases = [
        "Water supply is good, thank you",
        "Very frustrated! No water for 3 days",
        "Children are at risk due to open drain",
        "Please fix the pothole on main road"
    ]
    
    for text in test_cases:
        result = analyzer.analyze(text)
        print(f"\n📝 Text: {text}")
        print(f"😊 Sentiment: {result['polarity']} ({result['sentiment_score']})")
        print(f"⚡ Urgency Boost: {result['urgency_boost']}")
        print(f"💭 Emotion: {result['emotion']}")

def test_duplicate_detector():
    print("\n" + "="*50)
    print("TASK 7: DUPLICATE DETECTION TEST")
    print("="*50)
    
    detector = DuplicateDetector()
    
    # Submit same complaint twice
    text1 = "Water leakage near bus stand on main road"
    text2 = "Water leaking near the bus stand on main road"
    text3 = "Garbage not collected in my area"
    
    print(f"\n📝 Complaint 1: {text1}")
    result1 = detector.check_duplicate(text1, "user123")
    print(f"🔍 Duplicate: {result1['is_duplicate']}")
    print(f"📊 Similarity: {result1['similarity']}")
    
    print(f"\n📝 Complaint 2: {text2}")
    result2 = detector.check_duplicate(text2, "user123")
    print(f"🔍 Duplicate: {result2['is_duplicate']}")
    print(f"📊 Similarity: {result2['similarity']}")
    
    print(f"\n📝 Complaint 3: {text3}")
    result3 = detector.check_duplicate(text3, "user456")
    print(f"🔍 Duplicate: {result3['is_duplicate']}")
    print(f"📊 Similarity: {result3['similarity']}")

def test_complete_analysis():
    print("\n" + "="*50)
    print("COMPLETE AI ANALYSIS TEST")
    print("="*50)
    
    # Initialize all models
    dept_classifier = DepartmentClassifier()
    priority_predictor = PriorityPredictor()
    sentiment_analyzer = SentimentAnalyzer()
    hotspot_detector = HotspotDetector()
    duplicate_detector = DuplicateDetector()
    
    # Test complaint
    complaint = {
        "text": "URGENT! Water leakage causing danger to children near school",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "userId": "user789"
    }
    
    print(f"\n📝 Complaint: {complaint['text']}")
    print(f"📍 Location: ({complaint['latitude']}, {complaint['longitude']})")
    
    # Run all AI tasks
    department = dept_classifier.predict(complaint['text'])
    priority = priority_predictor.predict(complaint['text'])
    sentiment = sentiment_analyzer.analyze(complaint['text'])
    hotspot = hotspot_detector.check_hotspot(complaint['latitude'], complaint['longitude'])
    duplicate = duplicate_detector.check_duplicate(complaint['text'], complaint['userId'])
    
    # Adjust priority
    final_priority = priority
    if hotspot['is_hotspot']:
        final_priority = min(final_priority + 1, 3)
    if sentiment['urgency_boost']:
        final_priority = min(final_priority + 1, 3)
    
    print("\n" + "-"*50)
    print("AI ANALYSIS RESULTS:")
    print("-"*50)
    print(f"🏢 Department: {department}")
    print(f"⚡ Base Priority: {priority}")
    print(f"⚡ Final Priority: {final_priority}")
    print(f"😊 Sentiment: {sentiment['polarity']} ({sentiment['sentiment_score']})")
    print(f"🔥 Hotspot: {hotspot['is_hotspot']}")
    print(f"🔍 Duplicate: {duplicate['is_duplicate']}")
    print("-"*50)

if __name__ == "__main__":
    print("\n🤖 AI SERVICE TEST SUITE")
    print("Testing all AI features independently...\n")
    
    try:
        test_department_classifier()
        test_priority_predictor()
        test_hotspot_detector()
        test_sentiment_analyzer()
        test_duplicate_detector()
        test_complete_analysis()
        
        print("\n" + "="*50)
        print("✅ ALL TESTS COMPLETED SUCCESSFULLY!")
        print("="*50)
        
    except Exception as e:
        print(f"\n❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()
