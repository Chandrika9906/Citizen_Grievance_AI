"""
DEMO - See AI Output in Action
Make sure AI service is running (python app.py)
"""

import requests
import json

print("\n" + "="*70)
print("  AI SERVICE DEMO - LIVE OUTPUT")
print("="*70 + "\n")

BASE_URL = "http://localhost:5001"

# Check if service is running
try:
    response = requests.get(BASE_URL, timeout=2)
    print("[OK] AI Service is running!\n")
except:
    print("[ERROR] AI Service is not running!")
    print("Start it with: python app.py\n")
    exit(1)

# Test 1: Department Classification
print("="*70)
print("TEST 1: DEPARTMENT CLASSIFICATION")
print("="*70)

complaint1 = "Water leakage near bus stand"
print(f"\nComplaint: '{complaint1}'")

response = requests.post(f"{BASE_URL}/classify-department", 
                        json={"text": complaint1})
result = response.json()

print(f"\nAI OUTPUT:")
print(f"  Department: {result['department']}")
print(f"  Confidence: {result['confidence']:.1%}")

# Test 2: Priority Prediction
print("\n" + "="*70)
print("TEST 2: PRIORITY PREDICTION")
print("="*70)

complaint2 = "URGENT! Children at risk due to open manhole"
print(f"\nComplaint: '{complaint2}'")

response = requests.post(f"{BASE_URL}/predict-priority",
                        json={"text": complaint2, "latitude": 28.6, "longitude": 77.2})
result = response.json()

print(f"\nAI OUTPUT:")
print(f"  Priority: {result['priority']} (1=Low, 2=Medium, 3=High)")
print(f"  Reason: {result['reason']}")

# Test 3: Sentiment Analysis
print("\n" + "="*70)
print("TEST 3: SENTIMENT ANALYSIS")
print("="*70)

complaint3 = "Very frustrated! No water for 3 days"
print(f"\nComplaint: '{complaint3}'")

response = requests.post(f"{BASE_URL}/analyze-sentiment",
                        json={"text": complaint3})
result = response.json()

print(f"\nAI OUTPUT:")
print(f"  Sentiment: {result['polarity']}")
print(f"  Score: {result['sentiment_score']}")
print(f"  Urgency Boost: {result['urgency_boost']}")
print(f"  Emotion: {result['emotion']}")

# Test 4: COMPLETE ANALYSIS (ALL AI FEATURES)
print("\n" + "="*70)
print("TEST 4: COMPLETE AI ANALYSIS (ALL FEATURES COMBINED)")
print("="*70)

complaint4 = "URGENT water leakage causing danger to children near school"
print(f"\nComplaint: '{complaint4}'")
print(f"Location: (28.6139, 77.2090)")

response = requests.post(f"{BASE_URL}/analyze-complaint",
                        json={
                            "text": complaint4,
                            "latitude": 28.6139,
                            "longitude": 77.2090,
                            "userId": "user123"
                        })
result = response.json()

print(f"\nCOMPLETE AI OUTPUT:")
print(f"  Department: {result['department']}")
print(f"  Priority: {result['priority']}")
print(f"  Sentiment: {result['sentiment']['polarity']}")
print(f"  Urgency Boost: {result['sentiment']['urgency_boost']}")
print(f"  Is Hotspot: {result['hotspot']['is_hotspot']}")
print(f"  Nearby Complaints: {result['hotspot']['nearby_count']}")
print(f"  Is Duplicate: {result['duplicate']['is_duplicate']}")

print("\n" + "="*70)
print("  DEMO COMPLETE! YOUR AI IS WORKING!")
print("="*70)
print("\nAll AI features are working and producing results!")
print("\n")
