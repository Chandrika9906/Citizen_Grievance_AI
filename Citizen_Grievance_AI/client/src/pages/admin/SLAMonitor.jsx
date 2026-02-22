import { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';

export default function SLAMonitor() {
  const [slaData, setSlaData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await analyticsAPI.getSLA();
      setSlaData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Checking SLA compliance...</div>;

  const { summary } = slaData || {};

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">SLA Monitoring</h1>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="card bg-red-50">
          <h3 className="text-gray-600 text-sm">SLA Breached</h3>
          <p className="text-4xl font-bold text-red-600">{summary?.breached || 0}</p>
        </div>
        <div className="card bg-orange-50">
          <h3 className="text-gray-600 text-sm">Pending Complaints</h3>
          <p className="text-4xl font-bold text-orange-600">{summary?.pending || 0}</p>
        </div>
        <div className="card bg-green-50">
          <h3 className="text-gray-600 text-sm">Compliance Rate</h3>
          <p className="text-4xl font-bold text-green-600">{summary?.complianceRate || 0}%</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">SLA Compliance by Department</h2>
        <div className="space-y-4">
          {Object.entries(slaData?.byDepartment || {}).map(([dept, data]) => (
            <div key={dept} className="p-4 bg-white border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-lg">{dept}</p>
                  <p className="text-sm text-gray-500">Total: {data.total} | Met: {data.met} | Breached: {data.breached}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.round((data.met / data.total) * 100)}%
                  </p>
                  <p className="text-xs text-gray-500">Compliance</p>
                </div>
              </div>
            </div>
          ))}
          {Object.keys(slaData?.byDepartment || {}).length === 0 && (
            <p className="text-gray-500 text-center py-4">No data available for the current period.</p>
          )}
        </div>
      </div>
    </div>
  );
}
