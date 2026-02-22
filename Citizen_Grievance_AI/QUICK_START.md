# Quick Start Guide - Integrated Application

## Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- Git

## Step 1: Backend Setup

### 1.1 Navigate to server directory
```bash
cd Citizen_Grievance_AI/server
```

### 1.2 Install dependencies
```bash
npm install
```

### 1.3 Configure environment variables
Create `.env` file in `server/` directory:
```env
PORT=5000
MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/civicintel?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
AI_SERVICE_URL=http://localhost:5001
NODE_ENV=development
```

### 1.4 Start backend server
```bash
npm start
```

**Expected output:**
```
Server running on port 5000
MongoDB connected successfully
```

## Step 2: Frontend Setup

### 2.1 Navigate to client directory (new terminal)
```bash
cd Citizen_Grievance_AI/client
```

### 2.2 Install dependencies
```bash
npm install
```

### 2.3 Start frontend development server
```bash
npm run dev
```

**Expected output:**
```
VITE v4.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## Step 3: Access Application

Open browser and navigate to: **http://localhost:5173**

## Step 4: Test the Integration

### 4.1 Register a New User
1. Click "Register" on homepage
2. Fill in details:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - Role: Citizen
3. Click "Register"

### 4.2 Login
1. Use credentials from registration
2. Click "Login"
3. You should be redirected to dashboard

### 4.3 Submit a Complaint
1. Navigate to "Submit Complaint"
2. Fill in:
   - Description: "Street light not working"
   - Location: "Chennai"
   - Department: Select from dropdown
3. Click "Submit"
4. Check MongoDB to verify complaint was created

### 4.4 Verify Data in MongoDB
1. Go to MongoDB Atlas dashboard
2. Browse Collections → `complaints`
3. You should see your submitted complaint

## Step 5: Create Test Officer (Optional)

### 5.1 Register Officer Account
1. Logout from citizen account
2. Register new account with role "Officer"
3. Login as officer

### 5.2 Manually Update Officer in MongoDB
Since officer registration creates a user, you need to create an officer document:

1. Go to MongoDB Atlas
2. Navigate to `officers` collection
3. Insert document:
```json
{
  "name": "Officer John",
  "email": "officer@example.com",
  "phone": "+91 9876543210",
  "department": "Roads",
  "badgeNumber": "OFF001",
  "status": "FREE",
  "assignedComplaints": 0,
  "completedComplaints": 0
}
```

## Troubleshooting

### Backend won't start
**Error:** `MongoDB connection failed`
- Check MONGODB_URI in .env
- Verify MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for testing)
- Check network connection

**Error:** `Port 5000 already in use`
- Change PORT in .env to 5001
- Update frontend API URL in `client/src/services/api.js`

### Frontend won't start
**Error:** `Cannot find module`
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then reinstall

**Error:** `Network Error` when calling API
- Verify backend is running on port 5000
- Check CORS configuration in backend
- Verify API URL in `client/src/services/api.js`

### Data not showing
**Issue:** Dashboard shows "Loading..." forever
- Open browser console (F12)
- Check for API errors
- Verify JWT token in localStorage
- Check backend logs for errors

**Issue:** "No complaints found"
- This is normal for new users
- Submit a complaint first
- Verify complaint was created in MongoDB

### Authentication issues
**Issue:** Login fails with "Invalid credentials"
- Verify user exists in MongoDB `users` collection
- Check password is correct
- Verify JWT_SECRET is set in backend .env

**Issue:** Token expired
- Logout and login again
- Check JWT expiration time in backend

## API Endpoints Reference

### Auth
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login citizen
- POST `/api/auth/officer-login` - Login officer
- GET `/api/auth/profile` - Get user profile

### Complaints
- GET `/api/complaints` - Get all complaints
- POST `/api/complaints` - Create complaint
- GET `/api/complaints/:id` - Get complaint by ID
- PUT `/api/complaints/:id` - Update complaint
- DELETE `/api/complaints/:id` - Delete complaint

### Officers
- GET `/api/officers` - Get all officers
- POST `/api/officers` - Create officer
- PUT `/api/officers/:id/status` - Update officer status

### Notifications
- GET `/api/notifications` - Get user notifications
- PUT `/api/notifications/:id/read` - Mark as read
- DELETE `/api/notifications/:id` - Delete notification

### Settings
- GET `/api/settings` - Get user settings
- PUT `/api/settings` - Update settings

## Default Test Accounts

After initial setup, you can create these test accounts:

### Citizen
- Email: citizen@test.com
- Password: password123
- Role: Citizen

### Officer
- Email: officer@test.com
- Password: password123
- Role: Officer
- Department: Roads

### Admin
- Email: admin@test.com
- Password: password123
- Role: Admin

## Development Tips

### Hot Reload
- Frontend: Vite automatically reloads on file changes
- Backend: Use `nodemon` for auto-restart
  ```bash
  npm install -g nodemon
  nodemon server/index.js
  ```

### Debug Mode
- Frontend: Open browser DevTools (F12) → Console
- Backend: Add `console.log()` statements or use VS Code debugger

### Clear Data
To reset database:
1. Go to MongoDB Atlas
2. Delete all documents from collections
3. Restart backend

### Check API Responses
Use browser DevTools → Network tab to inspect API calls and responses

## Production Deployment

### Backend (Heroku/Railway/Render)
1. Push code to GitHub
2. Connect repository to hosting platform
3. Set environment variables
4. Deploy

### Frontend (Vercel/Netlify)
1. Build production bundle: `npm run build`
2. Deploy `dist/` folder
3. Update API base URL to production backend

## Support

For issues or questions:
1. Check browser console for errors
2. Check backend logs
3. Verify MongoDB connection
4. Review integration documentation

---

**Ready to start!** 🚀

Run both servers and access http://localhost:5173
