import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { complaintAPI } from '../../services/api';
import { Link } from 'react-router-dom';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, inProgress: 0 });
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const res = await complaintAPI.getUserComplaints(user._id);
      const data = res.data;
      setComplaints(data);
      setStats({
        total: data.length,
        pending: data.filter(c => c.status === 'WAITING').length,
        inProgress: data.filter(c => c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED').length,
        resolved: data.filter(c => c.status === 'RESOLVED').length
      });
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  const resolutionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
          Welcome back, {user?.name}! 👋
        </h1>
        <p style={{ color: '#64748b', fontSize: '16px' }}>
          Here's what's happening with your complaints today
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              📊
            </div>
          </div>
          <h3 style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
            Total Complaints
          </h3>
          <p style={{ fontSize: '36px', fontWeight: '700', color: 'white' }}>{stats.total}</p>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              ⏳
            </div>
          </div>
          <h3 style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
            Pending
          </h3>
          <p style={{ fontSize: '36px', fontWeight: '700', color: 'white' }}>{stats.pending}</p>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              🔄
            </div>
          </div>
          <h3 style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
            In Progress
          </h3>
          <p style={{ fontSize: '36px', fontWeight: '700', color: 'white' }}>{stats.inProgress}</p>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              ✅
            </div>
          </div>
          <h3 style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
            Resolved
          </h3>
          <p style={{ fontSize: '36px', fontWeight: '700', color: 'white' }}>{stats.resolved}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <div className="card">
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Performance Overview</h3>
          <div style={{ display: 'flex', gap: '24px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#64748b' }}>Resolution Rate</span>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>{resolutionRate}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${resolutionRate}%`, height: '100%', background: 'linear-gradient(90deg, #43e97b, #38f9d7)', transition: 'width 1s' }}></div>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#64748b' }}>Avg Response Time</span>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>2.5 days</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '70%', height: '100%', background: 'linear-gradient(90deg, #4facfe, #00f2fe)' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', opacity: 0.9 }}>Trust Score</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: '700'
            }}>
              85
            </div>
            <div>
              <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>Excellent Standing</p>
              <p style={{ fontSize: '12px', opacity: 0.7 }}>Keep up the good work!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Complaints */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b' }}>Recent Complaints</h2>
          <Link to="/citizen/complaints" className="btn-primary" style={{ textDecoration: 'none' }}>
            View All →
          </Link>
        </div>

        {complaints.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
            No complaints found. Submit a new complaint to get started!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {complaints.slice(0, 5).map((complaint, index) => (
              <div
                key={complaint._id}
                className="animate-slideIn"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '20px',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.3s',
                  animationDelay: `${index * 0.1}s`
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span className={`badge badge-${complaint.status.toLowerCase().replace('_', '')}`}>
                      {complaint.status.replace('_', ' ')}
                    </span>
                    <span className={`priority-${complaint.priority >= 3 ? 'high' : complaint.priority === 2 ? 'medium' : 'low'}`} style={{ fontSize: '13px' }}>
                      Priority {complaint.priority}
                    </span>
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                      {new Date(complaint.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <p style={{ fontWeight: '600', fontSize: '15px', color: '#1e293b', marginBottom: '6px' }}>
                    {complaint.description?.substring(0, 80)}...
                  </p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#64748b' }}>
                    {/* Simplified location display since 'location' field wasn't in schema but lat/lng is */}
                    <span>📍 {complaint.department} Dept</span>
                    <span>🏢 {complaint.department}</span>
                  </div>
                </div>
                <Link
                  to={`/citizen/complaint/${complaint._id}`}
                  className="btn-secondary"
                  style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
                >
                  View →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
