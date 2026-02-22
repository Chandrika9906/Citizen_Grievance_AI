import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, List, BarChart3, User, Settings, Bell, LogOut, CheckSquare, History, Users, Building2, FolderKanban, ClipboardList, UserCog, MapPin } from 'lucide-react';

export default function Sidebar({ role = 'citizen', onLogout }) {
  const routes = {
    citizen: [
      { to: '/citizen/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
      { to: '/citizen/submit', icon: <FileText size={18} />, label: 'Submit' },
      { to: '/citizen/complaints', icon: <List size={18} />, label: 'Complaints' },
      { to: '/citizen/analytics', icon: <BarChart3 size={18} />, label: 'Analytics' },
      { to: '/citizen/map', icon: <MapPin size={18} />, label: 'Insight Map' },
      { to: '/citizen/notifications', icon: <Bell size={18} />, label: 'Notifications' },
      { to: '/citizen/profile', icon: <User size={18} />, label: 'Profile' },
      { to: '/citizen/settings', icon: <Settings size={18} />, label: 'Settings' }
    ],
    officer: [
      { to: '/officer/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
      { to: '/officer/officer-status', icon: <Users size={18} />, label: 'Officer Status' },
      { to: '/officer/assignments', icon: <ClipboardList size={18} />, label: 'Assignments' },
      { to: '/officer/tasks', icon: <CheckSquare size={18} />, label: 'Tasks' },
      { to: '/officer/history', icon: <History size={18} />, label: 'History' },
      { to: '/officer/profile', icon: <User size={18} />, label: 'Profile' }
    ],
    admin: [
      { to: '/admin/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
      { to: '/admin/departments', icon: <Building2 size={18} />, label: 'Departments' },
      { to: '/admin/officer-management', icon: <UserCog size={18} />, label: 'Officer Status' },
      { to: '/admin/officers', icon: <Users size={18} />, label: 'Officers' },
      { to: '/admin/complaints', icon: <FolderKanban size={18} />, label: 'Complaints' },
      { to: '/admin/analytics', icon: <BarChart3 size={18} />, label: 'Analytics' },
      { to: '/admin/settings', icon: <Settings size={18} />, label: 'Settings' }
    ]
  };

  const links = routes[role] || routes.citizen;

  return (
    <div className="w-60 glass h-screen fixed left-0 top-0 flex flex-col shadow-xl">
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg">
            CI
          </div>
          <div>
            <h1 className="text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Civic Intel
            </h1>
            <p className="text-xs text-gray-600">Grievance System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${isActive
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-white/50'
              }`
            }
          >
            {link.icon}
            <span className="font-medium">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-white/20">
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-lg w-full text-sm text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut size={18} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
