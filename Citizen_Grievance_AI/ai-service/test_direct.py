"""
DIRECT TEST - No server needed!
This tests AI directly without API
"""

print("\n" + "="*60)
print("TESTING AI DIRECTLY")
print("="*60 + "\n")

# Test 1: Department Classification
print("TEST 1: Department Classification")
print("-"*60)

from models.department_classifier import DepartmentClassifier

classifier = DepartmentClassifier()

complaints = [
    "Water leakage near bus stand",
    "Big pothole on main road",
    "Garbage not collected for 3 days",
    "Power cut since morning"
]

for complaint in complaints:
    dept = classifier.predict(complaint)
    conf = classifier.get_confidence(complaint)
    print(f"\nComplaint: {complaint}")
    print(f"  -> Department: {dept}")
    print(f"  -> Confidence: {conf:.0%}")

# Test 2: Priority Prediction
print("\n\nTEST 2: Priority Prediction")
print("-"*60)

from models.priority_predictor import PriorityPredictor

predictor = PriorityPredictor()

urgent_complaints = [
    "Water leakage",
    "URGENT! Children at risk",
    "EMERGENCY! Fire hazard"
]

for complaint in urgent_complaints:
    priority = predictor.predict(complaint)
    print(f"\nComplaint: {complaint}")
    print(f"  -> Priority: {priority} (1=Low, 2=Medium, 3=High)")

# Test 3: Sentiment Analysis
print("\n\nTEST 3: Sentiment Analysis")
print("-"*60)

from models.sentiment_analyzer import SentimentAnalyzer

analyzer = SentimentAnalyzer()

sentiment_complaints = [
    "Thank you for good service",
    "Very frustrated! No water for 3 days",
    "Children are at risk"
]

for complaint in sentiment_complaints:
    result = analyzer.analyze(complaint)
    print(f"\nComplaint: {complaint}")
    print(f"  -> Sentiment: {result['polarity']}")
    print(f"  -> Urgency: {result['urgency_boost']}")

print("\n" + "="*60)
print("ALL TESTS COMPLETE!")
print("="*60)
print("\nYour AI is working! These are the actual outputs.")
print("\n")
