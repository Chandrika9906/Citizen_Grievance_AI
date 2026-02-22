import { useState, useEffect } from 'react';
import { analyticsAPI, complaintAPI } from '../../services/api';

export default function AdminAnalytics() {
  const [trendData, setTrendData] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [trendRes, statsRes] = await Promise.all([
        analyticsAPI.getTrends().catch(() => ({ data: { predictions: [] } })),
        complaintAPI.getStats()
      ]);
      setTrendData(trendRes.data.predictions || []);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Analytics & Trends</h1>

      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-4">Complaint Trend Forecast</h2>
        <div className="bg-gray-100 rounded-lg p-6 h-64 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl font-bold text-gray-600 mb-2">📈 Trend Chart</p>
            <p className="text-gray-500">Integrate Chart.js or Recharts here</p>
            <p className="text-sm text-gray-400 mt-2">
              Display weekly/monthly complaint trends with AI predictions
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Department Performance</h2>
          <div className="space-y-3">
            {stats?.byDepartment?.map(dept => (
              <div key={dept._id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">{dept._id || "Unclassified"}</span>
                  <span className="text-sm text-gray-600">{dept.count} complaints</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-blue-600"
                    style={{ width: `${Math.min((dept.count / (stats.total || 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">System Statistics</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Active Complaints</p>
              <p className="text-3xl font-bold text-blue-600">{stats?.total || 0}</p>
              <p className="text-sm text-blue-600 mt-1">Reflecting 100% real-time data</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Resolved Complaints</p>
              <p className="text-3xl font-bold text-purple-600">{stats?.byStatus?.resolved || 0}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Waiting for Assignment</p>
              <p className="text-3xl font-bold text-green-600">{stats?.byStatus?.waiting || 0}</p>
              <p className="text-sm text-green-600 mt-1">Needs attention</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
