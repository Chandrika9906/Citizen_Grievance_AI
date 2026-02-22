import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-purple-800 text-white">
        <div className="p-6 border-b border-purple-700">
          <h2 className="text-xl font-bold">Admin Portal</h2>
          <p className="text-sm text-purple-200 mt-1">{user?.name}</p>
        </div>
        <nav className="p-4 space-y-2">
          <NavLink to="/admin/dashboard" className={({ isActive }) => 
            `block px-4 py-3 rounded-lg transition ${isActive ? 'bg-purple-700' : 'hover:bg-purple-700'}`
          }>
            📊 Dashboard
          </NavLink>
          <NavLink to="/admin/heatmap" className={({ isActive }) => 
            `block px-4 py-3 rounded-lg transition ${isActive ? 'bg-purple-700' : 'hover:bg-purple-700'}`
          }>
            🗺️ Heatmap
          </NavLink>
          <NavLink to="/admin/analytics" className={({ isActive }) => 
            `block px-4 py-3 rounded-lg transition ${isActive ? 'bg-purple-700' : 'hover:bg-purple-700'}`
          }>
            📈 Analytics
          </NavLink>
          <NavLink to="/admin/officers" className={({ isActive }) => 
            `block px-4 py-3 rounded-lg transition ${isActive ? 'bg-purple-700' : 'hover:bg-purple-700'}`
          }>
            👮 Officers
          </NavLink>
          <NavLink to="/admin/sla" className={({ isActive }) => 
            `block px-4 py-3 rounded-lg transition ${isActive ? 'bg-purple-700' : 'hover:bg-purple-700'}`
          }>
            ⏱️ SLA Monitor
          </NavLink>
          <NavLink to="/admin/duplicates" className={({ isActive }) => 
            `block px-4 py-3 rounded-lg transition ${isActive ? 'bg-purple-700' : 'hover:bg-purple-700'}`
          }>
            🚫 Duplicates
          </NavLink>
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t border-purple-700">
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
