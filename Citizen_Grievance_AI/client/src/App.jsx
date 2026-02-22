import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Sidebar from './components/layout/Sidebar';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/citizen/Dashboard';
import SubmitComplaint from './pages/citizen/SubmitComplaint';
import MyComplaints from './pages/citizen/MyComplaints';
import ComplaintDetail from './pages/citizen/ComplaintDetail';
import Analytics from './pages/citizen/Analytics';
import Profile from './pages/citizen/Profile';
import Settings from './pages/citizen/Settings';
import Notifications from './pages/citizen/Notifications';
import ComplaintMap from './pages/citizen/ComplaintMap';
import OfficerDashboard from './pages/officer/OfficerDashboard';
import Tasks from './pages/officer/Tasks';
import History from './pages/officer/History';
import OfficerProfile from './pages/officer/OfficerProfile';
import AssignedComplaints from './pages/officer/AssignedComplaints';
import OfficerStatus from './pages/officer/OfficerStatus';
import AdminDashboard from './pages/admin/AdminDashboard';
import Departments from './pages/admin/Departments';
import OfficerManagement from './pages/admin/OfficerManagement';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import { Officers, AdminComplaints, AdminSettings } from './pages/admin/AdminPages';

function App() {
  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/citizen/*" element={
              <>
                <Sidebar role="citizen" onLogout={handleLogout} />
                <Routes>
                  <Route index element={<Navigate to="dashboard" />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="submit" element={<SubmitComplaint />} />
                  <Route path="complaints" element={<MyComplaints />} />
                  <Route path="complaints/:id" element={<ComplaintDetail />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="map" element={<ComplaintMap />} />
                </Routes>
              </>
            } />

            <Route path="/officer/*" element={
              <>
                <Sidebar role="officer" onLogout={handleLogout} />
                <Routes>
                  <Route index element={<Navigate to="dashboard" />} />
                  <Route path="dashboard" element={<OfficerDashboard />} />
                  <Route path="officer-status" element={<OfficerStatus />} />
                  <Route path="assignments" element={<AssignedComplaints />} />
                  <Route path="tasks" element={<Tasks />} />
                  <Route path="history" element={<History />} />
                  <Route path="profile" element={<OfficerProfile />} />
                </Routes>
              </>
            } />

            <Route path="/admin/*" element={
              <>
                <Sidebar role="admin" onLogout={handleLogout} />
                <Routes>
                  <Route index element={<Navigate to="dashboard" />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="departments" element={<Departments />} />
                  <Route path="officer-management" element={<OfficerManagement />} />
                  <Route path="officers" element={<Officers />} />
                  <Route path="complaints" element={<AdminComplaints />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Routes>
              </>
            } />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
