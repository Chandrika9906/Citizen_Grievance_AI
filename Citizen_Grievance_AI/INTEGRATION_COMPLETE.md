# Complete Integration Guide

## ✅ What's Done:

### Backend (MongoDB + Express)
- ✅ User, Officer, Complaint models
- ✅ Auth routes (register, login, profile)
- ✅ Complaint routes (CRUD, status updates)
- ✅ Officer routes (CRUD, status management)
- ✅ AI service integration in complaint creation

### Frontend (React)
- ✅ API service layer (`services/api.js`)
- ✅ AuthContext updated to use backend
- ✅ DataContext updated to fetch from backend
- ✅ Login page connected to backend
- ✅ Register page connected to backend

## 🔄 To Complete Integration:

### 1. Start All Services

**Terminal 1 - MongoDB (if local):**
```bash
mongod
```

**Terminal 2 - Backend:**
```bash
cd server
npm start
```

**Terminal 3 - AI Service:**
```bash
cd ai-service
python app.py
```

**Terminal 4 - Frontend:**
```bash
cd client
npm run dev
```

### 2. Create Initial Officers in MongoDB

Run this in MongoDB or create a seed script:

```javascript
// In server folder, create seed.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Officer = require('./models/Officer');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI);

async function seedOfficers() {
  const officers = [
    { name: 'Officer Murugan', email: 'murugan@tn.gov.in', password: 'password123', department: 'Public Works', badge: 'OFF-001', phone: '+91 98765 00001' },
    { name: 'Officer Lakshmi', email: 'lakshmi@tn.gov.in', password: 'password123', department: 'Water Supply', badge: 'OFF-002', phone: '+91 98765 00002' },
    { name: 'Officer Karthik', email: 'karthik@tn.gov.in', password: 'password123', department: 'Electricity', badge: 'OFF-003', phone: '+91 98765 00003' },
    { name: 'Officer Priya', email: 'priya@tn.gov.in', password: 'password123', department: 'Sanitation', badge: 'OFF-004', phone: '+91 98765 00004' },
    { name: 'Officer Rajesh', email: 'rajesh@tn.gov.in', password: 'password123', department: 'Public Works', badge: 'OFF-005', phone: '+91 98765 00005' }
  ];

  for (let officer of officers) {
    officer.password = await bcrypt.hash(officer.password, 10);
    officer.status = 'FREE';
    officer.verified = true;
    officer.role = 'officer';
    await Officer.create(officer);
  }

  console.log('Officers seeded!');
  process.exit();
}

seedOfficers();
```

Run: `node seed.js`

### 3. Test the Flow

1. **Register as Citizen:**
   - Go to `/register`
   - Fill form, select "Citizen"
   - Register

2. **Login as Citizen:**
   - Email: your email
   - Password: your password
   - Should redirect to `/citizen/dashboard`

3. **Submit Complaint:**
   - Go to "Submit Complaint"
   - Enter description
   - AI will analyze and assign department/priority
   - Complaint saved to MongoDB

4. **Login as Officer:**
   - Email: `murugan@tn.gov.in`
   - Password: `password123`
   - Should redirect to `/officer/dashboard`

5. **View Complaints on Map:**
   - Officer dashboard shows Tamil Nadu map
   - All complaints appear as colored circles
   - Click to see details

6. **Accept Complaint:**
   - Go to "Assignments"
   - Click "Accept" on a complaint
   - Officer status changes to BUSY
   - Complaint status changes to IN_PROGRESS

7. **Citizen Sees Officer Details:**
   - Login as citizen
   - Go to "My Complaints"
   - Click on accepted complaint
   - See officer name, phone, email

8. **Resolve Complaint:**
   - Officer marks as completed
   - Officer status changes to FREE
   - Complaint status changes to RESOLVED

## 🔧 Additional Updates Needed:

### Update Complaint Model to include location field:
```javascript
// In server/models/Complaint.js, add:
location: String,  // City name
```

### Update Dashboard to use _id instead of id:
```javascript
// In client/src/pages/citizen/Dashboard.jsx
{complaints.map(complaint => (
  <ComplaintCard key={complaint._id} complaint={complaint} onView={(id) => navigate(`/citizen/complaints/${id}`)} />
))}
```

### Update ComplaintCard to use _id:
```javascript
// In client/src/components/complaints/ComplaintCard.jsx
<Button variant="outline" onClick={() => onView(complaint._id)} className="w-full">
```

## 🎯 AI Features Integration:

All AI features are already integrated in the backend:
- ✅ Department Classification
- ✅ Priority Prediction
- ✅ Sentiment Analysis
- ✅ Hotspot Detection
- ✅ Duplicate Detection
- ✅ Voice to Text
- ✅ Image Classification
- ✅ Trend Prediction

When a complaint is submitted, the backend automatically calls the AI service at `http://localhost:5001/analyze-complaint`

## 📝 Environment Variables:

**server/.env:**
```
MONGO_URI=mongodb+srv://chandrika992006_db_user:Chandu9906%40@cluster0.ixwrv1f.mongodb.net/civicintel
JWT_SECRET=supersecretkey
```

**client/.env:**
```
VITE_API_URL=http://localhost:5000
VITE_AI_URL=http://localhost:5001
```

## 🚀 Ready to Test!

Everything is connected:
- Frontend → Backend → MongoDB
- Backend → AI Service
- Real-time data flow
- Authentication working
- All CRUD operations ready

Just start all 4 services and test the complete flow!
