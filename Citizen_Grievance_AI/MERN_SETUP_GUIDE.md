# MERN Stack Officer Dashboard - Complete Setup Guide

## 📁 Project Structure Created

```
Citizen_Grievance_AI/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── User.js
│   │   └── Complaint.js
│   ├── routes/
│   │   ├── complaintRoutes.js
│   │   ├── officerRoutes.js
│   │   └── dashboardRoutes.js
│   ├── controllers/
│   │   ├── complaintController.js
│   │   ├── officerController.js
│   │   └── dashboardController.js
│   ├── seed.js
│   ├── server.js
│   ├── package.json
│   └── .env
└── client/
    └── src/
        ├── services/
        │   └── apiService.js
        └── pages/officer/
            ├── OfficerDashboardExample.jsx
            ├── OfficerStatusExample.jsx
            ├── TasksExample.jsx
            └── HistoryExample.jsx
```

## 🚀 Installation & Setup Commands

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies (if not already done)
```bash
cd client
npm install axios
```

### 3. Environment Setup
Backend `.env` file is already configured with:
```
MONGO_URI=mongodb+srv://chandrika992006_db_user:Chandu9906%40@cluster0.ixwrv1f.mongodb.net/civicintel
PORT=5001
```

### 4. Seed Database with Sample Data
```bash
cd backend
npm run seed
```

### 5. Start Backend Server
```bash
cd backend
npm start
```
Backend will run on: http://localhost:5001

### 6. Start Frontend (in separate terminal)
```bash
cd client
npm run dev
```
Frontend will run on: http://localhost:5173

## 📊 Sample Data Created

### Officers (5 total):
- **John Smith** - Water Dept (W001) - FREE
- **Sarah Johnson** - Water Dept (W002) - BUSY  
- **Mike Davis** - Road Dept (R001) - FREE
- **Lisa Wilson** - Road Dept (R002) - BUSY
- **David Brown** - General Dept (G001) - FREE

### Complaints (10 total):
- **3 CRITICAL** (Water main burst, Bridge damage, Power line down)
- **3 HIGH** (Sewage overflow, Potholes, Building safety)
- **2 MEDIUM** (Water pressure, Street lights)
- **2 LOW** (Road crack, Park maintenance)

### Status Distribution:
- PENDING: 3 complaints
- ASSIGNED: 3 complaints  
- IN_PROGRESS: 2 complaints
- RESOLVED: 2 complaints

## 🔌 API Endpoints Available

### Dashboard API
- `GET /api/dashboard?officerId={id}` - Get officer dashboard stats

### Complaints API
- `GET /api/complaints` - Get all complaints
- `GET /api/complaints/officer/{officerId}` - Get complaints by officer
- `POST /api/complaints` - Create new complaint
- `PUT /api/complaints/{id}` - Update complaint status
- `DELETE /api/complaints/{id}` - Delete complaint

### Officers API
- `GET /api/officers` - Get all officers
- `PUT /api/officers/{id}/status` - Update officer status

## 🎯 Frontend Integration Examples

### 1. Replace Hardcoded Dashboard
Replace your existing `OfficerDashboard.jsx` with API calls:

```jsx
import { dashboardAPI } from '../../services/apiService';

useEffect(() => {
  const fetchData = async () => {
    const response = await dashboardAPI.getStats(officerId);
    setDashboardData(response.data);
  };
  fetchData();
}, []);
```

### 2. Replace Hardcoded Officer Status
```jsx
import { officersAPI } from '../../services/apiService';

useEffect(() => {
  const fetchOfficers = async () => {
    const response = await officersAPI.getAll();
    setOfficers(response.data);
  };
  fetchOfficers();
}, []);
```

### 3. Replace Hardcoded Tasks
```jsx
import { complaintsAPI } from '../../services/apiService';

useEffect(() => {
  const fetchTasks = async () => {
    const response = await complaintsAPI.getByOfficer(officerId);
    setComplaints(response.data);
  };
  fetchTasks();
}, []);
```

## ✅ Verification Steps

1. **Backend Running**: Visit http://localhost:5001 - should show "Officer Dashboard API is running!"

2. **Database Seeded**: Check MongoDB - should have 5 officers and 10 complaints

3. **API Working**: Test endpoints:
   - http://localhost:5001/api/officers
   - http://localhost:5001/api/complaints
   - http://localhost:5001/api/dashboard?officerId=OFFICER_ID

4. **Frontend Integration**: Import and use the example components

## 🔧 Next Steps

1. **Replace Officer ID**: Update hardcoded `officerId` with actual auth context
2. **Add Authentication**: Implement JWT auth middleware
3. **Error Handling**: Add proper error boundaries
4. **Loading States**: Implement loading spinners
5. **Real-time Updates**: Add WebSocket for live updates

## 📝 Dashboard Features Now Working

- ✅ **Live Data**: All stats from real database
- ✅ **Active Tasks**: Shows officer's assigned complaints  
- ✅ **Critical Alerts**: Shows system-wide critical issues
- ✅ **Department Stats**: Shows department-specific metrics
- ✅ **Status Updates**: Officers can update complaint status
- ✅ **History**: Shows resolved complaints
- ✅ **Officer Management**: Update officer availability

The dashboard now displays **non-zero values** from the seeded database!