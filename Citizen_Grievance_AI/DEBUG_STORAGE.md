# 🐛 Debugging Database Storage Issue

## Step-by-Step Diagnostic

### 1. Check Services Are Running

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
**Expected Output:**
```
Server running on port 5000
MongoDB Connected ✅
```

**If you DON'T see "MongoDB Connected ✅":**
- Check `.env` file has correct `MONGO_URI`
- Check MongoDB is running (MongoDB Compass should connect)
- Check network connection

### 2. Test Complaint Submission

**Open Browser:**
1. Go to `http://localhost:5173`
2. Login: `citizen@test.com` / `password123`
3. Open Browser Console (F12)
4. Go to Submit page
5. Enter description (or use voice)
6. Click Submit

### 3. Check Console Logs

**Browser Console Should Show:**
```
🔵 [SUBMIT] Starting submission...
🔵 [SUBMIT] User: 65abc123...
🔵 [SUBMIT] Description: There is a garbage problem...
🤖 [SUBMIT] Calling AI service for analysis...
✅ [SUBMIT] AI analysis received: { department: 'Sanitation', ... }
📤 [SUBMIT] Sending payload to backend: { userId: '...', description: '...', ... }
✅ [SUBMIT] Complaint saved to MongoDB: { message: '...', data: { _id: '...', ... } }
🔄 [SUBMIT] Navigating to dashboard...
```

**Backend Terminal Should Show:**
```
🔵 [CREATE] Request received
📦 [CREATE] Request body: {
  "userId": "65abc123...",
  "description": "There is a garbage problem...",
  "department": "Sanitation",
  "priority": 3,
  ...
}
📝 [CREATE] Parsed fields: { userId: '...', department: 'Sanitation', ... }
✅ [CREATE] Using AI data from frontend
🔨 [CREATE] Creating new Complaint object...
💾 [CREATE] Saving to MongoDB...
✅ [CREATE] Saved successfully! ID: 65xyz789...
👮 [CREATE] Auto-assigning to officer...
✅ [CREATE] Officer assigned: Officer Name
📤 [CREATE] Sending response: { message: '...', data: { ... } }
```

## Common Issues & Fixes

### Issue 1: "MongoDB Connected ✅" NOT showing

**Problem:** Backend can't connect to MongoDB

**Check:**
```bash
# In server/.env
MONGO_URI=mongodb://localhost:27017/citizen_grievance_ai
# OR if using Atlas
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/citizen_grievance_ai
```

**Fix:**
- Start MongoDB locally: `mongod`
- Or check Atlas connection string
- Test connection with MongoDB Compass

### Issue 2: AI Service Error

**Problem:** Browser console shows: "Failed to process voice" or "Failed to classify image"

**Check:** Terminal running AI service?
```bash
cd ai-service
python app.py
```

**Expected:** `📡 Running on http://localhost:5001`

**Fix:** Start AI service if not running

### Issue 3: Request Not Reaching Backend

**Problem:** No logs in backend terminal when clicking Submit

**Check:**
- Backend running on port 5000?
- Frontend API URL correct?

**In `client/src/services/api.js`:**
```javascript
const API_URL = 'http://localhost:5000/api';  // ← Should be this
```

**Fix:** Restart backend server

### Issue 4: Complaint Saves But Doesn't Show in Dashboard

**Problem:** Backend logs show "✅ Saved successfully" but dashboard is empty

**Check Dashboard API Call:**

1. Open Dashboard
2. Check browser console Network tab
3. Look for: `GET /api/complaints/user/...`
4. Check response

**If response is empty `[]`:**
- UserId mismatch
- Wrong collection
- MongoDB query issue

**Fix:** Check user ID matches between submission and fetch

### Issue 5: Success Message Shows But No Data in MongoDB

**Problem:** Alert says "Saved to MongoDB" but Compass shows nothing

**Possible Causes:**
1. Connected to different database
2. Save didn't commit
3. Wrong collection name

**Fix:**
1. Check MongoDB Compass connection string matches backend
2. Check database name: `citizen_grievance_ai`
3. Check collection name: `complaints`
4. Manually query: `db.complaints.find({})`

## Verification Checklist

After submitting complaint, verify ALL of these:

### ✅ Backend Logs
- [ ] "🔵 [CREATE] Request received"
- [ ] "📦 [CREATE] Request body: {...}"
- [ ] "💾 [CREATE] Saving to MongoDB..."
- [ ] "✅ [CREATE] Saved successfully! ID: ..."
- [ ] "📤 [CREATE] Sending response:"

### ✅ Frontend Logs
- [ ] "🔵 [SUBMIT] Starting submission..."
- [ ] "✅ [SUBMIT] AI analysis received:"
- [ ] "📤 [SUBMIT] Sending payload to backend:"
- [ ] "✅ [SUBMIT] Complaint saved to MongoDB:"
- [ ] "🔄 [SUBMIT] Navigating to dashboard..."

### ✅ MongoDB Compass
- [ ] Open Compass
- [ ] Connect to same URI as backend
- [ ] Navigate to `citizen_grievance_ai` database
- [ ] Open `complaints` collection
- [ ] Click refresh
- [ ] See new document with matching ID

### ✅ Dashboard
- [ ] Redirects to `/citizen/dashboard`
- [ ] Shows "All Complaints" with count increased
- [ ] New complaint visible in list
- [ ] Shows department, priority, status

## Test Now!

1. **Clear everything:**
   - Close all browser tabs
   - Stop all terminals
   - Restart everything fresh

2. **Start services:**
   ```bash
   # Terminal 1
   cd server && npm run dev
   
   # Terminal 2  
   cd ai-service && python app.py
   
   # Terminal 3
   cd client && npm run dev
   ```

3. **Test submission:**
   - Login
   - Submit complaint
   - **Watch BOTH consoles!**

4. **If it fails:**
   - Copy ENTIRE backend terminal output
   - Copy ENTIRE browser console output
   - Check which step failed
   - Look for "❌" error messages

5. **If it succeeds:**
   - You'll see "✅ Saved successfully! ID: ..."
   - Dashboard will show new complaint
   - MongoDB Compass will show new document

## Report Results

After testing, you should know:
1. ✅ Where exactly it fails (if it does)
2. ✅ What error message appears
3. ✅ Which console (backend or frontend) shows the error
4. ✅ If MongoDB connection works

**The detailed logs will show EXACTLY where the problem is!**
