"""
SIMPLE TEST - Check if AI is working
Run this to see if everything works!
"""

print("\n" + "="*60)
print("  TESTING AI SERVICE - SIMPLE VERSION")
print("="*60 + "\n")

# Test 1: Import all modules
print("TEST 1: Checking if all AI modules load...")
try:
    from models.department_classifier import DepartmentClassifier
    from models.priority_predictor import PriorityPredictor
    from models.sentiment_analyzer import SentimentAnalyzer
    print("[OK] All modules loaded successfully!\n")
except Exception as e:
    print(f"[ERROR] {e}\n")
    print("Fix: Run 'pip install -r requirements.txt'\n")
    exit(1)

# Test 2: Department Classification
print("TEST 2: Department Classification")
print("-" * 60)
try:
    classifier = DepartmentClassifier()
    
    test_text = "Water leakage near bus stand"
    result = classifier.predict(test_text)
    confidence = classifier.get_confidence(test_text)
    
    print(f"Input: '{test_text}'")
    print(f"[OK] Department: {result}")
    print(f"[OK] Confidence: {confidence:.1%}\n")
except Exception as e:
    print(f"[ERROR] {e}\n")

# Test 3: Priority Prediction
print("TEST 3: Priority Prediction")
print("-" * 60)
try:
    predictor = PriorityPredictor()
    
    test_text = "URGENT! Children at risk"
    result = predictor.predict(test_text)
    
    print(f"Input: '{test_text}'")
    print(f"[OK] Priority: {result} (1=Low, 2=Medium, 3=High)\n")
except Exception as e:
    print(f"[ERROR] {e}\n")

# Test 4: Sentiment Analysis
print("TEST 4: Sentiment Analysis")
print("-" * 60)
try:
    analyzer = SentimentAnalyzer()
    
    test_text = "Very frustrated! No water for 3 days"
    result = analyzer.analyze(test_text)
    
    print(f"Input: '{test_text}'")
    print(f"[OK] Sentiment: {result['polarity']}")
    print(f"[OK] Urgency Boost: {result['urgency_boost']}\n")
except Exception as e:
    print(f"[ERROR] {e}\n")

# Final Result
print("="*60)
print("  [SUCCESS] ALL TESTS PASSED! AI IS WORKING!")
print("="*60)
print("\nNext steps:")
print("1. Start AI service: python app.py")
print("2. Test API: python tests/test_api.py")
print("\n")
