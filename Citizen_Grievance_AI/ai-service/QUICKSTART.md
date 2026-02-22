# 🚀 QUICK START GUIDE

## Step 1: Install Dependencies (5 minutes)

```bash
cd D:\Blaze2026\Citizen_Grievance_AI\ai-service
pip install -r requirements.txt
```

## Step 2: Download NLTK Data (1 minute)

```bash
python -c "import nltk; nltk.download('punkt'); nltk.download('brown')"
```

## Step 3: Test AI Features WITHOUT Backend (2 minutes)

```bash
python tests/test_all.py
```

This will test ALL 8 AI tasks independently!

## Step 4: Start AI Service (1 minute)

```bash
python app.py
```

AI Service runs on: `http://localhost:5001`

## Step 5: Test API Endpoints (2 minutes)

Open another terminal:

```bash
python tests/test_api.py
```

---

## 🎯 YOU'RE DONE!

Now you have:
- ✅ All 8 AI tasks working
- ✅ REST API running on port 5001
- ✅ Can work independently without backend/frontend
- ✅ Backend team can integrate later with simple API calls

---

## 📝 WHAT EACH FILE DOES

| File | Purpose |
|------|---------|
| `app.py` | Main Flask API server |
| `models/department_classifier.py` | TASK 1: Classify department |
| `models/priority_predictor.py` | TASK 2: Predict priority |
| `models/hotspot_detector.py` | TASK 3: Detect complaint hotspots |
| `models/voice_processor.py` | TASK 4: Voice to text |
| `models/image_classifier.py` | TASK 5: Image classification |
| `models/sentiment_analyzer.py` | TASK 6: Sentiment analysis |
| `models/duplicate_detector.py` | TASK 7: Duplicate detection |
| `models/trend_predictor.py` | TASK 8: Trend prediction |
| `tests/test_all.py` | Test all features offline |
| `tests/test_api.py` | Test API endpoints |
| `retrain_model.py` | Retrain with more data |

---

## 🔥 NEXT STEPS

1. **Improve accuracy**: Add more training data in `data/training_dataset.py`
2. **Retrain model**: Run `python retrain_model.py`
3. **Add image model**: Train CNN for pothole/garbage detection
4. **Share with team**: Give them API endpoints

---

## 💡 TESTING EXAMPLES

### Test Department Classification
```bash
curl -X POST http://localhost:5001/classify-department \
  -H "Content-Type: application/json" \
  -d '{"text": "Water leakage near bus stand"}'
```

### Test Complete Analysis
```bash
curl -X POST http://localhost:5001/analyze-complaint \
  -H "Content-Type: application/json" \
  -d '{
    "text": "URGENT! Water leakage causing danger",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "userId": "user123"
  }'
```

---

## 🐛 COMMON ISSUES

**Issue**: Module not found
**Fix**: `pip install -r requirements.txt`

**Issue**: NLTK data not found
**Fix**: `python -c "import nltk; nltk.download('punkt')"`

**Issue**: Port already in use
**Fix**: Change port in `app.py` line 124: `app.run(port=5002)`

---

Good luck! 🔥
