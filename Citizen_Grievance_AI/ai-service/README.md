# 🤖 AI Service - Citizen Grievance System

Standalone AI microservice for complaint analysis and classification.

## 📋 AI TASKS CHECKLIST

### ✅ COMPLETED (Basic Implementation)
- [x] **TASK 1**: Department Classification (TF-IDF + Logistic Regression)
- [x] **TASK 2**: Priority Prediction (Keyword + Sentiment based)
- [x] **TASK 3**: Hotspot Detection (Geolocation clustering)
- [x] **TASK 4**: Voice to Text (Speech Recognition API)
- [x] **TASK 5**: Image Classification (Placeholder - needs model)
- [x] **TASK 6**: Sentiment Analysis (TextBlob)
- [x] **TASK 7**: Duplicate Detection (TF-IDF similarity)
- [x] **TASK 8**: Trend Prediction (Time series analysis)

### 🔧 TO IMPROVE
- [ ] Collect more training data for department classifier (100-200 samples)
- [ ] Train better image classification model (CNN/YOLO)
- [ ] Add offline voice recognition (Whisper/Vosk)
- [ ] Improve trend prediction with regression models
- [ ] Add more department categories
- [ ] Fine-tune priority prediction weights

---

## 🚀 SETUP INSTRUCTIONS

### 1. Install Dependencies
```bash
cd ai-service
pip install -r requirements.txt
```

### 2. Download NLTK Data (First time only)
```python
python -c "import nltk; nltk.download('punkt'); nltk.download('brown')"
```

### 3. Test AI Features (Without Backend)
```bash
python tests/test_all.py
```

### 4. Run AI Service
```bash
python app.py
```

AI Service will run on: `http://localhost:5001`

---

## 📡 API ENDPOINTS

### 1. Department Classification
```bash
POST http://localhost:5001/classify-department
Body: {"text": "Water leakage near bus stand"}
```

### 2. Priority Prediction
```bash
POST http://localhost:5001/predict-priority
Body: {
  "text": "URGENT! Children at risk",
  "latitude": 28.6139,
  "longitude": 77.2090
}
```

### 3. Hotspot Detection
```bash
POST http://localhost:5001/detect-hotspot
Body: {"latitude": 28.6139, "longitude": 77.2090}
```

### 4. Sentiment Analysis
```bash
POST http://localhost:5001/analyze-sentiment
Body: {"text": "Very frustrated with the service"}
```

### 5. Duplicate Detection
```bash
POST http://localhost:5001/detect-duplicate
Body: {"text": "Water leakage...", "userId": "user123"}
```

### 6. Voice to Text
```bash
POST http://localhost:5001/voice-to-text
Body: FormData with audio file
```

### 7. Image Classification
```bash
POST http://localhost:5001/classify-image
Body: FormData with image file
```

### 8. Trend Prediction
```bash
POST http://localhost:5001/predict-trend
Body: {"department": "Water", "days": 7}
```

### 9. Complete Analysis (All AI Tasks Combined)
```bash
POST http://localhost:5001/analyze-complaint
Body: {
  "text": "Water leakage near school",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "userId": "user123"
}
```

---

## 🧪 TESTING WITHOUT BACKEND

You can test all AI features independently:

```bash
python tests/test_all.py
```

This will test:
- Department classification
- Priority prediction
- Hotspot detection
- Sentiment analysis
- Duplicate detection
- Complete analysis pipeline

---

## 🔗 BACKEND INTEGRATION

Your backend team just needs to call your AI API:

```javascript
// In backend (Node.js)
const response = await fetch('http://localhost:5001/analyze-complaint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: complaintText,
    latitude: lat,
    longitude: lng,
    userId: userId
  })
});

const aiResult = await response.json();
// Use aiResult.department, aiResult.priority, etc.
```

---

## 📁 PROJECT STRUCTURE

```
ai-service/
├── app.py                          # Flask API server
├── requirements.txt                # Python dependencies
├── models/
│   ├── department_classifier.py    # TASK 1
│   ├── priority_predictor.py       # TASK 2
│   ├── hotspot_detector.py         # TASK 3
│   ├── voice_processor.py          # TASK 4
│   ├── image_classifier.py         # TASK 5
│   ├── sentiment_analyzer.py       # TASK 6
│   ├── duplicate_detector.py       # TASK 7
│   └── trend_predictor.py          # TASK 8
├── data/                           # Data storage
│   ├── complaints_history.json
│   └── recent_complaints.json
├── tests/
│   └── test_all.py                 # Test all features
└── README.md                       # This file
```

---

## 🎯 NEXT STEPS

1. **Test the AI service**: Run `python tests/test_all.py`
2. **Start the API**: Run `python app.py`
3. **Improve models**: Add more training data
4. **Train image model**: Collect pothole/garbage images
5. **Share API with team**: Give them `http://localhost:5001` endpoints

---

## 💡 TIPS

- Work independently - no need to wait for backend/frontend
- Test each AI task separately
- Improve models incrementally
- Backend integration is just API calls (2-3 lines of code)
- Focus on AI accuracy, not backend complexity

---

## 🐛 TROUBLESHOOTING

**Error: Module not found**
```bash
pip install -r requirements.txt
```

**Error: NLTK data not found**
```python
import nltk
nltk.download('punkt')
nltk.download('brown')
```

**Error: Port 5001 already in use**
Change port in `app.py`: `app.run(port=5002)`

---

## 📞 INTEGRATION WITH TEAM

When your teammates are ready:

1. **Backend**: Add API calls to your AI service
2. **Frontend**: Display AI results (department, priority, etc.)
3. **You**: Keep improving AI models independently

Your AI service runs separately - easy to update without breaking anything!

---

Good luck with your hackathon! 🔥
