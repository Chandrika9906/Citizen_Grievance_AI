import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { complaintAPI } from '../../services/api';

export default function CitizenAnalytics() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await complaintAPI.getUserComplaints(user._id);
      setComplaints(res.data);
      
      const byMonth = {};
      res.data.forEach(c => {
        const month = new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        byMonth[month] = (byMonth[month] || 0) + 1;
      });
      
      setStats({
        total: res.data.length,
        resolved: res.data.filter(c => c.status === 'RESOLVED').length,
        avgResolutionTime: calculateAvgResolution(res.data),
        byMonth
      });
    } catch (err) {
      console.error(err);
    }
  };

  const calculateAvgResolution = (complaints) => {
    const resolved = complaints.filter(c => c.resolvedDate);
    if (resolved.length === 0) return 0;
    
    const totalDays = resolved.reduce((sum, c) => {
      const days = Math.ceil((new Date(c.resolvedDate) - new Date(c.createdAt)) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);
    
    return Math.round(totalDays / resolved.length);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Analytics</h1>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="card bg-blue-50">
          <h3 className="text-gray-600 text-sm">Total Complaints</h3>
          <p className="text-4xl font-bold text-blue-600">{stats.total}</p>
        </div>
        <div className="card bg-green-50">
          <h3 className="text-gray-600 text-sm">Resolved</h3>
          <p className="text-4xl font-bold text-green-600">{stats.resolved}</p>
        </div>
        <div className="card bg-purple-50">
          <h3 className="text-gray-600 text-sm">Avg Resolution Time</h3>
          <p className="text-4xl font-bold text-purple-600">{stats.avgResolutionTime} days</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">Complaint Trend</h2>
        <div className="space-y-3">
          {Object.entries(stats.byMonth || {}).map(([month, count]) => (
            <div key={month} className="flex items-center gap-4">
              <span className="w-24 text-sm font-semibold">{month}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-8">
                <div
                  className="bg-blue-600 h-8 rounded-full flex items-center justify-end pr-3 text-white text-sm font-semibold"
                  style={{ width: `${(count / Math.max(...Object.values(stats.byMonth || {}))) * 100}%` }}
                >
                  {count}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card mt-6">
        <h2 className="text-xl font-bold mb-4">Trust Score</h2>
        <div className="flex items-center gap-6">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
            <span className="text-4xl font-bold text-white">85</span>
          </div>
          <div>
            <p className="text-lg font-semibold">Good Standing</p>
            <p className="text-gray-600">Based on complaint history and resolution confirmations</p>
          </div>
        </div>
      </div>
    </div>
  );
}
