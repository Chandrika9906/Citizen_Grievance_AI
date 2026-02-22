# 👀 HOW TO SEE AI OUTPUT - VISUAL GUIDE

## 🎯 STEP-BY-STEP INSTRUCTIONS

### STEP 1: Make Sure AI Service is Running

**Terminal 1** (Keep this running):
```bash
cd D:\Blaze2026\Citizen_Grievance_AI\ai-service
python app.py
```

You should see:
```
✅ Department Classifier loaded
🤖 AI Service Starting...
📡 Running on http://localhost:5001
```

**✅ Keep this terminal open!**

---

### STEP 2: Choose How to See Output

## 🌐 OPTION A: Browser (Simplest)

1. Open your browser (Chrome/Edge/Firefox)
2. Go to: `http://localhost:5001`
3. You'll see JSON with all endpoints

**Example Output:**
```json
{
  "message": "AI Service Running 🤖",
  "endpoints": [
    "/classify-department",
    "/predict-priority",
    ...
  ]
}
```

---

## 💻 OPTION B: Demo Script (Best - Shows Real AI)

**Open NEW terminal** (Terminal 2):
```bash
cd D:\Blaze2026\Citizen_Grievance_AI\ai-service
python demo.py
```

**You'll see:**
```
TEST 1: DEPARTMENT CLASSIFICATION
Complaint: 'Water leakage near bus stand'

AI OUTPUT:
  Department: Water
  Confidence: 95.2%

TEST 2: PRIORITY PREDICTION
Complaint: 'URGENT! Children at risk'

AI OUTPUT:
  Priority: 3 (High)
  Reason: High urgency keyword: 'urgent'

TEST 3: SENTIMENT ANALYSIS
Complaint: 'Very frustrated! No water for 3 days'

AI OUTPUT:
  Sentiment: negative
  Score: -0.45
  Urgency Boost: True
  Emotion: frustrated

TEST 4: COMPLETE AI ANALYSIS
Complaint: 'URGENT water leakage near school'

COMPLETE AI OUTPUT:
  Department: Water
  Priority: 3
  Sentiment: negative
  Urgency Boost: True
  Is Hotspot: False
  Is Duplicate: False
```

---

## 🔧 OPTION C: Postman/Thunder Client

1. Install Postman or Thunder Client (VS Code extension)
2. Create POST request to: `http://localhost:5001/analyze-complaint`
3. Body (JSON):
```json
{
  "text": "Water leakage near school",
  "latitude": 28.6,
  "longitude": 77.2,
  "userId": "user123"
}
```
4. Click Send
5. See AI output in response!

---

## 🖥️ OPTION D: Command Line (curl)

**Open NEW terminal:**
```bash
curl http://localhost:5001
```

**Test complete analysis:**
```bash
curl -X POST http://localhost:5001/analyze-complaint -H "Content-Type: application/json" -d "{\"text\":\"Water leakage\",\"latitude\":28.6,\"longitude\":77.2,\"userId\":\"user1\"}"
```

---

## 📊 WHAT YOU'LL SEE

### Example AI Output:
```json
{
  "department": "Water",
  "priority": 2,
  "sentiment": {
    "polarity": "negative",
    "sentiment_score": -0.3,
    "urgency_boost": false,
    "emotion": "none"
  },
  "hotspot": {
    "is_hotspot": false,
    "nearby_count": 1,
    "priority_boost": 0
  },
  "duplicate": {
    "is_duplicate": false,
    "similarity": 0.0
  },
  "analysis_complete": true
}
```

---

## ✅ QUICK CHECKLIST

- [ ] Terminal 1: `python app.py` is running
- [ ] Terminal 2: Run `python demo.py` to see output
- [ ] Browser: Open `http://localhost:5001` to verify
- [ ] See AI results for department, priority, sentiment, etc.

---

## 🎬 RECOMMENDED: Use demo.py

**It's the easiest way to see your AI working!**

```bash
# Terminal 1 (keep running)
python app.py

# Terminal 2 (run this)
python demo.py
```

**You'll see all AI features in action with real output!** 🚀
