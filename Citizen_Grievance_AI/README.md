# 🚀 AI-Powered Citizen Grievance Management System

A modern, full-stack web application for managing citizen complaints with AI-powered analysis, real-time tracking, and interactive dashboards.

![Tech Stack](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## 📋 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🎯 Core Features
- **Multi-Role Authentication**: Separate portals for Citizens, Officers, and Admins
- **AI-Powered Analysis**: Automatic department classification, priority prediction, and sentiment analysis
- **Real-time Tracking**: Live complaint status updates and officer assignment
- **Interactive Maps**: Leaflet-based visualization of complaint locations across Tamil Nadu
- **Smart Notifications**: Real-time alerts for status changes and updates
- **Advanced Analytics**: Charts, trends, and insights dashboard
- **Auto-Assignment**: Intelligent officer allocation based on department and availability

### 👥 User Roles

#### 🏠 Citizen Portal
- Submit complaints with location tracking
- Track complaint status in real-time
- View assigned officer details
- Interactive complaint map
- Notification center
- Profile and settings management
- Analytics dashboard

#### 👮 Officer Portal
- View department-specific complaints
- Accept/reject complaint assignments
- Update complaint status
- Interactive map with priority-coded markers
- Officer status management (FREE/BUSY)
- Performance statistics

#### 🔐 Admin Portal
- System-wide analytics and reports
- Officer management (CRUD operations)
- Department management
- Auto-assignment configuration
- SLA compliance tracking
- Duplicate complaint detection
- Advanced analytics (heatmaps, trends, predictions)

## 🛠 Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Leaflet** - Interactive maps
- **Recharts** - Data visualization
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin support

### AI Services (Optional)
- Department classification
- Priority prediction
- Sentiment analysis
- Duplicate detection
- Voice-to-text
- Image classification

## 📁 Project Structure

```
Citizen_Grievance_AI/
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── ui/          # Base components (Button, Card, Input)
│   │   │   ├── layout/      # Layout components
│   │   │   └── complaints/  # Complaint-specific components
│   │   ├── context/         # React Context (Auth, Data)
│   │   ├── pages/           # Page components
│   │   │   ├── auth/        # Login, Register
│   │   │   ├── citizen/     # Citizen portal pages
│   │   │   ├── officer/     # Officer portal pages
│   │   │   └── admin/       # Admin portal pages
│   │   ├── services/        # API service layer
│   │   └── App.jsx          # Main app component
│   ├── public/              # Static assets
│   └── package.json
│
├── server/                   # Backend Node.js application
│   ├── models/              # MongoDB schemas
│   │   ├── User.js
│   │   ├── Complaint.js
│   │   ├── Officer.js
│   │   ├── Department.js
│   │   ├── Notification.js
│   │   └── Settings.js
│   ├── routes/              # API routes
│   │   ├── authRoutes.js
│   │   ├── complaintRoutes.js
│   │   ├── officerRoutes.js
│   │   ├── departmentRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── settingsRoutes.js
│   │   ├── userRoutes.js
│   │   └── analyticsRoutes.js
│   ├── index.js             # Server entry point
│   ├── seedDatabase.js      # Database seeding script
│   └── package.json
│
└── README.md
```

## 🚀 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- Git

### Step 1: Clone Repository
```bash
git clone https://github.com/yourusername/citizen-grievance-ai.git
cd citizen-grievance-ai
```

### Step 2: Backend Setup
```bash
cd server
npm install
```

Create `.env` file in `server/` directory:
```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/civicintel?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_in_production
AI_SERVICE_URL=http://localhost:5001
NODE_ENV=development
```

### Step 3: Frontend Setup
```bash
cd ../client
npm install
```

### Step 4: Seed Database (Create Test Users)
```bash
cd ../server
node createTestUser.js
```

This creates a test account:
- **Email**: test@test.com
- **Password**: password123
- **Role**: Citizen

## ⚙️ Configuration

### MongoDB Atlas Setup
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Add database user
4. Whitelist IP address (0.0.0.0/0 for testing)
5. Get connection string and add to `.env`

### Environment Variables

#### Backend (.env)
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
AI_SERVICE_URL=http://localhost:5001
NODE_ENV=development
```

#### Frontend (Optional - client/.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_AI_BASE_URL=http://localhost:5001
```

## 🎮 Usage

### Start Backend Server
```bash
cd server
npm start
```
Server runs on: http://localhost:5000

### Start Frontend Development Server
```bash
cd client
npm run dev
```
Frontend runs on: http://localhost:5173

### Access Application
Open browser and navigate to: **http://localhost:5173**

### Test Accounts
After running seed script:
- **Citizen**: test@test.com / password123
- **Officer**: officer@test.com / password123 (if seeded)
- **Admin**: admin@test.com / password123 (if seeded)

## 📡 API Documentation

### Authentication Endpoints
```
POST   /api/auth/register          - Register new citizen
POST   /api/auth/login             - Citizen login
POST   /api/auth/officer-login     - Officer login
GET    /api/auth/profile           - Get user profile
PUT    /api/auth/profile           - Update profile
```

### Complaint Endpoints
```
GET    /api/complaints             - Get all complaints
POST   /api/complaints             - Create complaint
GET    /api/complaints/:id         - Get complaint by ID
PUT    /api/complaints/:id         - Update complaint
DELETE /api/complaints/:id         - Delete complaint
POST   /api/complaints/:id/assign  - Assign officer
PUT    /api/complaints/:id/status  - Update status
PUT    /api/complaints/:id/resolve - Resolve complaint
```

### Officer Endpoints
```
GET    /api/officers               - Get all officers
POST   /api/officers               - Create officer
GET    /api/officers/:id           - Get officer by ID
PUT    /api/officers/:id           - Update officer
DELETE /api/officers/:id           - Delete officer
PUT    /api/officers/:id/status    - Update status
GET    /api/officers/available/:dept - Get available officers
```

### Department Endpoints
```
GET    /api/departments            - Get all departments
POST   /api/departments            - Create department
GET    /api/departments/:id        - Get department by ID
PUT    /api/departments/:id        - Update department
DELETE /api/departments/:id        - Delete department
GET    /api/departments/:id/stats  - Get department stats
```

### Notification Endpoints
```
GET    /api/notifications          - Get user notifications
PUT    /api/notifications/:id/read - Mark as read
DELETE /api/notifications/:id      - Delete notification
DELETE /api/notifications/clear    - Clear all
GET    /api/notifications/unread/count - Get unread count
```

### Analytics Endpoints (Admin Only)
```
GET    /api/analytics/heatmap      - Get heatmap data
GET    /api/analytics/trends       - Get trend predictions
GET    /api/analytics/duplicates   - Detect duplicates
GET    /api/analytics/sla          - SLA compliance
GET    /api/analytics/department/:dept - Department analytics
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3B82F6) to Purple (#9333EA) gradient
- **Success**: Green (#10B981)
- **Warning**: Amber (#F59E0B)
- **Error**: Red (#EF4444)
- **Neutral**: Gray shades

### Component Sizes
- **Buttons**: h-9 (36px), text-sm
- **Cards**: p-4, rounded-lg
- **Icons**: 18-20px
- **Headings**: text-xl (20px)

### Glassmorphism Effect
```css
.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
```

## 🗺️ Map Integration

### Tamil Nadu Cities Supported
- Chennai, Coimbatore, Madurai, Tiruchirappalli, Salem
- Tirunelveli, Erode, Vellore, Thoothukudi, Thanjavur
- Dindigul, Kanchipuram, Karur, Rajapalayam, Nagercoil

### Priority Color Coding
- 🔴 **Red**: Critical/High Priority (4-5)
- 🟡 **Yellow**: Normal Priority (3)
- 🟢 **Green**: Low Priority (1-2)

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Protected API routes
- Input validation
- CORS configuration
- Secure HTTP headers

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (citizen/officer/admin),
  phone: String,
  address: String,
  city: String,
  state: String,
  pincode: String
}
```

### Complaint Model
```javascript
{
  description: String,
  location: String,
  latitude: Number,
  longitude: Number,
  department: String,
  priority: Number (1-5),
  status: String (WAITING/ASSIGNED/IN_PROGRESS/RESOLVED/REJECTED),
  citizenId: ObjectId,
  assignedOfficer: ObjectId,
  createdAt: Date,
  resolvedDate: Date
}
```

## 🧪 Testing

### Manual Testing
1. Register new user
2. Login with credentials
3. Submit complaint
4. Check MongoDB for data
5. Test officer assignment
6. Verify notifications

### API Testing with cURL
```bash
# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# Test get complaints (with token)
curl http://localhost:5000/api/complaints \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Check MONGO_URI in .env
- Verify IP whitelist in MongoDB Atlas
- Check network connection

**Port Already in Use**
- Change PORT in .env
- Kill process: `lsof -ti:5000 | xargs kill -9` (Mac/Linux)

**Login Returns 400 Error**
- Run seed script to create test user
- Verify user exists in MongoDB
- Check password is correct

**Data Not Showing**
- Check browser console for errors
- Verify backend is running
- Check JWT token in localStorage
- Ensure API calls are successful

## 🚀 Deployment

### Backend (Heroku/Railway/Render)
1. Push code to GitHub
2. Connect repository
3. Set environment variables
4. Deploy

### Frontend (Vercel/Netlify)
1. Build: `npm run build`
2. Deploy `dist/` folder
3. Update API URL to production backend

## 📈 Future Enhancements

- [ ] WebSocket for real-time updates
- [ ] Push notifications
- [ ] Mobile app (React Native)
- [ ] Multi-language support (i18n)
- [ ] Voice complaint submission
- [ ] Image upload for complaints
- [ ] PDF report generation
- [ ] Email notifications
- [ ] SMS integration
- [ ] Advanced ML predictions
- [ ] Chatbot support

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## 🙏 Acknowledgments

- MongoDB Atlas for database hosting
- OpenStreetMap for map tiles
- Lucide for beautiful icons
- TailwindCSS for styling system

## 📞 Support

For support, email support@example.com or open an issue on GitHub.

---

**Made with ❤️ for better civic engagement**

⭐ Star this repo if you find it helpful!
