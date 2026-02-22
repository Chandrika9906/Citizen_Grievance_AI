"""
Simple test client to test AI API endpoints
Run this after starting the AI service (python app.py)
"""

import requests
import json

BASE_URL = "http://localhost:5001"

def test_department_classification():
    print("\n" + "="*60)
    print("TEST 1: DEPARTMENT CLASSIFICATION")
    print("="*60)
    
    response = requests.post(
        f"{BASE_URL}/classify-department",
        json={"text": "Water leakage near bus stand"}
    )
    
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

def test_priority_prediction():
    print("\n" + "="*60)
    print("TEST 2: PRIORITY PREDICTION")
    print("="*60)
    
    response = requests.post(
        f"{BASE_URL}/predict-priority",
        json={
            "text": "URGENT! Children at risk due to open manhole",
            "latitude": 28.6139,
            "longitude": 77.2090
        }
    )
    
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

def test_complete_analysis():
    print("\n" + "="*60)
    print("TEST 3: COMPLETE COMPLAINT ANALYSIS")
    print("="*60)
    
    response = requests.post(
        f"{BASE_URL}/analyze-complaint",
        json={
            "text": "Water leakage causing danger to children near school",
            "latitude": 28.6139,
            "longitude": 77.2090,
            "userId": "user123"
        }
    )
    
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

def test_sentiment_analysis():
    print("\n" + "="*60)
    print("TEST 4: SENTIMENT ANALYSIS")
    print("="*60)
    
    response = requests.post(
        f"{BASE_URL}/analyze-sentiment",
        json={"text": "Very frustrated! No water for 3 days"}
    )
    
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

if __name__ == "__main__":
    print("\n🤖 AI SERVICE API TEST CLIENT")
    print("Make sure AI service is running on http://localhost:5001\n")
    
    try:
        # Test if service is running
        response = requests.get(BASE_URL)
        print(f"✅ AI Service is running!")
        print(f"Available endpoints: {response.json()['endpoints']}")
        
        # Run tests
        test_department_classification()
        test_priority_prediction()
        test_sentiment_analysis()
        test_complete_analysis()
        
        print("\n" + "="*60)
        print("✅ ALL API TESTS COMPLETED!")
        print("="*60)
        
    except requests.exceptions.ConnectionError:
        print("❌ Error: AI service is not running!")
        print("Start it with: python app.py")
    except Exception as e:
        print(f"❌ Error: {e}")
