# 🚀 HOW TO RUN - SUPER SIMPLE GUIDE

## ⚡ FASTEST WAY (Windows)

### Option 1: One-Click Setup (Recommended)
```bash
# Just double-click this file:
setup_and_test.bat
```
This will:
- ✅ Install everything
- ✅ Test everything
- ✅ Tell you if it's working

---

### Option 2: Manual Steps

**STEP 1: Open Terminal**
- Press `Win + R`
- Type `cmd` and press Enter
- Navigate to AI folder:
```bash
cd D:\Blaze2026\Citizen_Grievance_AI\ai-service
```

**STEP 2: Install Dependencies**
```bash
pip install flask flask-cors scikit-learn pandas numpy joblib nltk textblob geopy pillow
```
Wait for installation... (2-3 minutes)

**STEP 3: Download NLTK Data**
```bash
python -c "import nltk; nltk.download('punkt'); nltk.download('brown')"
```

**STEP 4: Test if AI Works**
```bash
python simple_test.py
```

**You should see:**
```
✅ All modules loaded successfully!
✅ Department: Water
✅ Priority: 3
✅ Sentiment: negative
✅ ALL TESTS PASSED! AI IS WORKING!
```

**STEP 5: Start AI Service**
```bash
python app.py
```

**You should see:**
```
🤖 AI Service Starting...
📡 Running on http://localhost:5001
✅ Department Classifier loaded
```

**STEP 6: Test API (Open NEW terminal)**
```bash
cd D:\Blaze2026\Citizen_Grievance_AI\ai-service
python tests\test_api.py
```

**You should see:**
```
✅ AI Service is running!
Status: 200
Response: {"department": "Water", "confidence": 0.95}
✅ ALL API TESTS COMPLETED!
```

---

## 🎯 QUICK CHECK - Is It Working?

### ✅ Test 1: Simple Test
```bash
python simple_test.py
```
**Expected**: See ✅ marks and "ALL TESTS PASSED"

### ✅ Test 2: Start Service
```bash
python app.py
```
**Expected**: See "Running on http://localhost:5001"

### ✅ Test 3: Open Browser
Go to: `http://localhost:5001`

**Expected**: See JSON with message "AI Service Running 🤖"

### ✅ Test 4: Test API
```bash
python tests\test_api.py
```
**Expected**: See "ALL API TESTS COMPLETED!"

---

## ❌ TROUBLESHOOTING

### Problem: "pip is not recognized"
**Fix**: Install Python first from python.org

### Problem: "Module not found"
**Fix**: 
```bash
pip install -r requirements.txt
```

### Problem: "NLTK data not found"
**Fix**:
```bash
python -c "import nltk; nltk.download('punkt'); nltk.download('brown')"
```

### Problem: "Port 5001 already in use"
**Fix**: Edit `app.py` line 124, change `5001` to `5002`

### Problem: Tests fail
**Fix**: Check error message, usually missing package
```bash
pip install <package-name>
```

---

## 📊 WHAT EACH FILE DOES

| File | What It Does | When to Run |
|------|--------------|-------------|
| `simple_test.py` | Quick test (no API) | First time |
| `app.py` | Starts AI service | Every time you want to use AI |
| `tests/test_api.py` | Tests API endpoints | After starting app.py |
| `setup_and_test.bat` | Does everything | First time setup |
| `start.bat` | Starts service | Quick start |

---

## 🎬 DEMO SCENARIO

**To show your team it's working:**

1. **Start service**: `python app.py`
2. **Open browser**: Go to `http://localhost:5001`
3. **Test with Postman/curl**:
```bash
curl -X POST http://localhost:5001/analyze-complaint ^
  -H "Content-Type: application/json" ^
  -d "{\"text\":\"Water leakage near school\",\"latitude\":28.6139,\"longitude\":77.2090,\"userId\":\"user123\"}"
```

4. **Show result**:
```json
{
  "department": "Water",
  "priority": 2,
  "sentiment": {"polarity": "negative"},
  "hotspot": {"is_hotspot": false},
  "duplicate": {"is_duplicate": false}
}
```

---

## ✅ SUCCESS CHECKLIST

- [ ] Ran `simple_test.py` - saw ✅ marks
- [ ] Ran `python app.py` - service started
- [ ] Opened `http://localhost:5001` in browser - saw JSON
- [ ] Ran `tests/test_api.py` - all tests passed
- [ ] Tested with sample complaint - got department & priority

**If all checked ✅ = YOU'RE READY! 🎉**

---

## 🔥 NEXT STEPS

1. ✅ Everything working? → Share API with backend team
2. 🔧 Want better accuracy? → Add more data in `data/training_dataset.py`
3. 🚀 Ready to integrate? → Show backend team `BACKEND_INTEGRATION.js`

---

**Need help? Check the error message and look in TROUBLESHOOTING section above!**
