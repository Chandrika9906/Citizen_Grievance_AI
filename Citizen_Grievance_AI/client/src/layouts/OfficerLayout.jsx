import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OfficerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-green-800 text-white">
        <div className="p-6 border-b border-green-700">
          <h2 className="text-xl font-bold">Officer Portal</h2>
          <p className="text-sm text-green-200 mt-1">{user?.name}</p>
        </div>
        <nav className="p-4 space-y-2">
          <NavLink to="/officer/dashboard" className={({ isActive }) => 
            `block px-4 py-3 rounded-lg transition ${isActive ? 'bg-green-700' : 'hover:bg-green-700'}`
          }>
            📊 Dashboard
          </NavLink>
          <NavLink to="/officer/assigned" className={({ isActive }) => 
            `block px-4 py-3 rounded-lg transition ${isActive ? 'bg-green-700' : 'hover:bg-green-700'}`
          }>
            📋 Assigned Complaints
          </NavLink>
          <NavLink to="/officer/workload" className={({ isActive }) => 
            `block px-4 py-3 rounded-lg transition ${isActive ? 'bg-green-700' : 'hover:bg-green-700'}`
          }>
            ⚡ Workload
          </NavLink>
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t border-green-700">
          <button onClick={handleLogout} className="w-full px-4 py-3 bg-red-600 rounded-lg hover:bg-red-700 transition">
            🚪 Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
