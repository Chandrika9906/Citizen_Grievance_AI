# 🚀 INTEGRATION ROADMAP - STEP BY STEP

## ✅ CURRENT STATUS
- AI Service: 100% Complete
- Backend: Basic structure ready
- Frontend: UI components ready

---

## 📋 INTEGRATION ORDER

### STEP 1: Backend Integration ✅ DONE
### STEP 2: Test Backend + AI
### STEP 3: Frontend Integration
### STEP 4: End-to-End Testing

---

## 🔧 STEP 1: BACKEND INTEGRATION (✅ COMPLETED)

**What I did:**
- Updated `server/routes/complaintRoutes.js`
- Added AI service API call
- Replaced keyword matching with real AI
- Added fallback logic if AI service is down

**Changes:**
- ✅ Calls `http://localhost:5001/analyze-complaint`
- ✅ Gets department, priority, sentiment, hotspot, duplicate
- ✅ Saves to MongoDB
- ✅ Returns AI analysis to frontend

---

## 🧪 STEP 2: TEST BACKEND + AI (DO THIS NOW)

### A. Start AI Service
```bash
# Terminal 1
cd D:\Blaze2026\Citizen_Grievance_AI\ai-service
python app.py
```

Expected output:
```
AI Service Starting...
Running on http://localhost:5001
```

### B. Start Backend
```bash
# Terminal 2
cd D:\Blaze2026\Citizen_Grievance_AI\server
npm start
```

Expected output:
```
Server running on port 5000
MongoDB Connected ✅
```

### C. Test Integration
```bash
# Terminal 3 - Test with curl
curl -X POST http://localhost:5000/api/complaints/create ^
  -H "Content-Type: application/json" ^
  -d "{\"userId\":\"test123\",\"description\":\"URGENT water leakage near school\",\"latitude\":28.6,\"longitude\":77.2}"
```

Expected response:
```json
{
  "message": "Complaint submitted successfully",
  "department": "Water",
  "priority": 3,
  "aiAnalysis": {
    "sentiment": "negative",
    "isHotspot": false,
    "isDuplicate": false
  }
}
```

---

## 🎨 STEP 3: FRONTEND INTEGRATION (DO AFTER TESTING)

### A. Create API Service File

Create: `client/src/services/api.js`

```javascript
const API_URL = "http://localhost:5000/api";

export const submitComplaint = async (complaintData) => {
  const response = await fetch(`${API_URL}/complaints/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify(complaintData)
  });
  
  if (!response.ok) {
    throw new Error("Failed to submit complaint");
  }
  
  return response.json();
};

export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) {
    throw new Error("Login failed");
  }
  
  return response.json();
};

export const register = async (name, email, password) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  });
  
  if (!response.ok) {
    throw new Error("Registration failed");
  }
  
  return response.json();
};
```

### B. Update Complaint Form

Update: `client/src/pages/ComplaintForm.jsx`

Add this to handle form submission:

```javascript
import { submitComplaint } from "../services/api";

const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const result = await submitComplaint({
      userId: localStorage.getItem("userId"),
      description: complaintText,
      latitude: location.lat,
      longitude: location.lng
    });
    
    alert(`Complaint submitted!
Department: ${result.department}
Priority: ${result.priority}
Sentiment: ${result.aiAnalysis.sentiment}`);
    
    // Reset form
    setComplaintText("");
  } catch (error) {
    alert("Error: " + error.message);
  }
};
```

### C. Update Login Page

Update: `client/src/pages/Login.jsx`

Add API integration:

```javascript
import { login, register } from "../services/api";

const handleLogin = async (e) => {
  e.preventDefault();
  
  try {
    const result = await login(email, password);
    
    localStorage.setItem("token", result.token);
    localStorage.setItem("userId", result.userId);
    localStorage.setItem("role", result.role);
    
    if (result.role === "citizen") {
      navigate("/citizen/dashboard");
    } else {
      navigate("/officer/dashboard");
    }
  } catch (error) {
    alert("Login failed: " + error.message);
  }
};
```

---

## ✅ STEP 4: END-TO-END TESTING

### Test Flow:
1. ✅ Start AI Service (Port 5001)
2. ✅ Start Backend (Port 5000)
3. ✅ Start Frontend (Port 5173)
4. ✅ Register user
5. ✅ Login
6. ✅ Submit complaint
7. ✅ Check AI analysis in response
8. ✅ Verify in MongoDB

---

## 🎯 QUICK START COMMANDS

```bash
# Terminal 1: AI Service
cd D:\Blaze2026\Citizen_Grievance_AI\ai-service
python app.py

# Terminal 2: Backend
cd D:\Blaze2026\Citizen_Grievance_AI\server
npm start

# Terminal 3: Frontend
cd D:\Blaze2026\Citizen_Grievance_AI\client
npm run dev
```

Then open: http://localhost:5173

---

## 🐛 TROUBLESHOOTING

### Backend can't connect to AI:
- Check AI service is running on port 5001
- Test: `curl http://localhost:5001`

### Frontend can't connect to Backend:
- Check backend is running on port 5000
- Enable CORS in backend (already done)

### MongoDB connection error:
- Check `.env` file has correct MONGO_URI
- Start MongoDB service

---

## 📊 WHAT YOU'LL SEE

### When complaint is submitted:
1. Frontend sends to Backend
2. Backend calls AI Service
3. AI analyzes:
   - Department (90.96% accuracy)
   - Priority (1-3)
   - Sentiment (positive/negative/neutral)
   - Hotspot (true/false)
   - Duplicate (true/false)
4. Backend saves to MongoDB
5. Frontend shows result with AI analysis

---

## 🎬 DEMO FLOW

1. User submits: "URGENT water leakage near school"
2. AI detects:
   - Department: Water
   - Priority: 3 (High)
   - Sentiment: Negative
   - Urgency: True
3. System routes to Water Department
4. Officer gets high-priority alert

---

## ✅ CHECKLIST

- [x] AI Service running (Port 5001)
- [x] Backend integrated with AI
- [ ] Backend tested with curl
- [ ] Frontend API service created
- [ ] Frontend forms updated
- [ ] End-to-end test complete

---

**NEXT STEP**: Test backend integration with curl command above! 🚀
