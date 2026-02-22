# Fix 400 Bad Request Error

## Problem
Getting "400 Bad Request" error when trying to login. This means either:
1. No users exist in the database yet
2. Email/password don't match
3. Backend is not running

## Solution

### Step 1: Make sure backend is running
```bash
cd server
npm start
```

You should see:
```
Server running on port 5000
MongoDB Connected ✅
```

### Step 2: Seed the database with test users

Run this command in the `server` directory:
```bash
node seedDatabase.js
```

This will create:
- **Citizen Account**: citizen@test.com / password123
- **Officer Account**: officer@test.com / password123  
- **Admin Account**: admin@test.com / password123
- **5 Departments**: Roads, Water, Electricity, Sanitation, Health

### Step 3: Test login

1. Open frontend: http://localhost:5173
2. Click "Login"
3. Use credentials:
   - Email: `citizen@test.com`
   - Password: `password123`
   - Role: Citizen
4. Click "Login"

### Step 4: If still getting error

Check backend console for error messages. Common issues:

**"User not found"**
- User doesn't exist in database
- Run seed script again
- Check MongoDB Atlas to verify user was created

**"Invalid password"**
- Password is incorrect
- Use: `password123`

**"Cannot connect to MongoDB"**
- Check MONGO_URI in .env file
- Verify MongoDB Atlas IP whitelist
- Check internet connection

### Step 5: Verify in MongoDB Atlas

1. Go to MongoDB Atlas dashboard
2. Click "Browse Collections"
3. Select database: `civicintel` (or your database name)
4. Check `users` collection
5. You should see test users

### Alternative: Register a new user

Instead of using seed script, you can register:

1. Click "Register" on homepage
2. Fill in:
   - Name: Your Name
   - Email: your@email.com
   - Password: yourpassword
   - Role: Citizen
3. Click "Register"
4. Then login with those credentials

## Quick Test Commands

### Check if backend is running:
```bash
curl http://localhost:5000
```

Should return: "Server Running 🚀"

### Test login endpoint:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"citizen@test.com","password":"password123"}'
```

Should return token if user exists.

## Still not working?

1. Check `.env` file exists in `server/` directory
2. Verify MONGO_URI is correct
3. Check MongoDB Atlas network access (allow 0.0.0.0/0 for testing)
4. Restart backend server
5. Clear browser cache and localStorage
6. Check browser console for detailed error messages
