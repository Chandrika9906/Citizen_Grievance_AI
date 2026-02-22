# Complete Startup Guide

Follow these steps in order to get the full system running:

## Step 1: Start Backend Server
Open a terminal and run:
```bash
cd server
npm run dev
```
**Expected Output:** "Server running on port 5000" or "MongoDB Connected"

## Step 2: Seed the Database
Open a NEW terminal and run:
```bash
cd server
node seedDatabase.js
```
**Expected Output:** "✅ Database seeded successfully"

This creates:
- Test Citizen: `citizen@test.com` / `password123`
- Test Officer: `officer@test.com` / `password123`
- Test Admin: `admin@test.com` / `password123`
- 30 sample complaints

## Step 3: Start AI Service (Optional but Recommended)
Open a NEW terminal and run:
```bash
cd ai-service
python app.py
```
**Expected Output:** "AI Service Running on http://localhost:5001"

## Step 4: Start Frontend
Open a NEW terminal and run:
```bash
cd client
npm run dev
```
**Expected Output:** "Local: http://localhost:5173"

## Step 5: Test the Connection

1. Open your browser to `http://localhost:5173`
2. Login as **Citizen**: `citizen@test.com` / `password123`
3. You should see:
   - Recent complaints
   - Statistics (not 0 0 0)
   - Real data in the dashboard

## Troubleshooting

### Frontend shows 0 0 0
- **Cause**: Backend not running or database empty
- **Fix**: Complete Steps 1 and 2 above

### "Network Error" or "Failed to fetch"
- **Cause**: Backend server not running
- **Fix**: Check Step 1

### "Cannot connect to MongoDB"
- **Cause**: MongoDB not running
- **Fix**: Start MongoDB service or check MONGO_URI in `.env`

### Empty dashboard after login
- **Cause**: Database not seeded
- **Fix**: Run Step 2 (seedDatabase.js)
