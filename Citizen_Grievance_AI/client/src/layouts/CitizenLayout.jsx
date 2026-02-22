import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function CitizenLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sidebar */}
      <aside style={{
        width: '280px',
        background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        boxShadow: '4px 0 24px rgba(102, 126, 234, 0.3)'
      }}>
        {/* Logo & Header */}
        <div style={{
          padding: '28px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              background: 'linear-gradient(135deg, #fff 0%, #f0f0f0 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}>
              🏢
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '2px' }}>Civic Intel</h2>
              <p style={{ fontSize: '11px', opacity: 0.8 }}>Smart Grievance System</p>
            </div>
          </div>

          {/* User Profile */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '12px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #43e97b, #38f9d7)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#1e293b'
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </h3>
              <p style={{ fontSize: '11px', opacity: 0.8 }}>Citizen</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '20px 16px', overflowY: 'auto' }}>
          <div style={{ marginBottom: '12px', padding: '0 12px', fontSize: '10px', fontWeight: '700', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '1.2px' }}>
            Main Menu
          </div>

          <NavLink
            to="/citizen/dashboard"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: '10px',
              textDecoration: 'none',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '6px',
              transition: 'all 0.3s',
              background: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              boxShadow: isActive ? '0 4px 12px rgba(0, 0, 0, 0.1)' : 'none'
            })}
          >
            <span style={{ fontSize: '18px' }}>📊</span>
            Dashboard
          </NavLink>

          <NavLink
            to="/citizen/submit"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: '10px',
              textDecoration: 'none',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '6px',
              transition: 'all 0.3s',
              background: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              boxShadow: isActive ? '0 4px 12px rgba(0, 0, 0, 0.1)' : 'none'
            })}
          >
            <span style={{ fontSize: '18px' }}>✍️</span>
            Submit Complaint
          </NavLink>

          <NavLink
            to="/citizen/complaints"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: '10px',
              textDecoration: 'none',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '6px',
              transition: 'all 0.3s',
              background: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              boxShadow: isActive ? '0 4px 12px rgba(0, 0, 0, 0.1)' : 'none'
            })}
          >
            <span style={{ fontSize: '18px' }}>📋</span>
            My Complaints
          </NavLink>

          <NavLink
            to="/citizen/analytics"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: '10px',
              textDecoration: 'none',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '6px',
              transition: 'all 0.3s',
              background: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              boxShadow: isActive ? '0 4px 12px rgba(0, 0, 0, 0.1)' : 'none'
            })}
          >
            <span style={{ fontSize: '18px' }}>📈</span>
            Analytics
          </NavLink>

          <div style={{ margin: '20px 0', height: '1px', background: 'rgba(255, 255, 255, 0.15)' }}></div>

          <div style={{ marginBottom: '12px', padding: '0 12px', fontSize: '10px', fontWeight: '700', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '1.2px' }}>
            Quick Actions
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '14px',
            borderRadius: '10px',
            marginBottom: '10px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', opacity: 0.9 }}>Active Complaints</span>
              <span style={{ fontSize: '16px', fontWeight: '700' }}>
                {user?.activeComplaints || 3}
              </span>
            </div>
            <div style={{ width: '100%', height: '4px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: '60%', height: '100%', background: 'linear-gradient(90deg, #43e97b, #38f9d7)' }}></div>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '14px',
            borderRadius: '10px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', opacity: 0.9 }}>Resolution Rate</span>
              <span style={{ fontSize: '16px', fontWeight: '700' }}>85%</span>
            </div>
            <div style={{ width: '100%', height: '4px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: '85%', height: '100%', background: 'linear-gradient(90deg, #f093fb, #f5576c)' }}></div>
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.15)' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '12px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '10px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(239, 68, 68, 0.25)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(239, 68, 68, 0.15)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <span style={{ fontSize: '16px' }}>🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
        marginLeft: '280px',
        flex: 1,
        padding: '40px',
        minHeight: '100vh'
      }}>
        <Outlet />
      </main>
    </div>
  );
}
