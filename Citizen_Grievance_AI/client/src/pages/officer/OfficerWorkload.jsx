import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { complaintAPI, officerAPI } from '../../services/api';

export default function OfficerWorkload() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [status, setStatus] = useState('AVAILABLE');

  useEffect(() => {
    fetchData();
  }, [user._id]);

  const fetchData = async () => {
    try {
      const [complaintsRes, officerRes] = await Promise.all([
        complaintAPI.getOfficerComplaints(user._id),
        officerAPI.getById(user._id)
      ]);
      setComplaints(complaintsRes.data);
      if (officerRes.data) {
        setStatus(officerRes.data.status);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setStatus(newStatus); // Optimistic
      await officerAPI.updateStatus(user._id, newStatus);
    } catch (err) {
      console.error("Failed to update status", err);
      // Revert if needed, or just let fetching handle it next time
    }
  };

  const activeComplaints = complaints.filter(c => c.status !== 'RESOLVED');
  const workloadPercentage = Math.min((activeComplaints.length / 10) * 100, 100);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Workload Management</h1>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="text-lg font-bold mb-4">Current Status</h3>
          <div className="flex gap-4">
            <button
              onClick={() => handleStatusChange('FREE')}
              className={`flex-1 py-3 rounded-lg font-semibold transition ${status === 'FREE' ? 'bg-green-600 text-white' : 'bg-gray-200'
                }`}
            >
              ✅ Available
            </button>
            <button
              onClick={() => handleStatusChange('BUSY')}
              className={`flex-1 py-3 rounded-lg font-semibold transition ${status === 'BUSY' ? 'bg-red-600 text-white' : 'bg-gray-200'
                }`}
            >
              🚫 Busy
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-bold mb-4">Active Tasks</h3>
          <div className="text-center">
            <p className="text-5xl font-bold text-blue-600">{activeComplaints.length}</p>
            <p className="text-gray-600 mt-2">Complaints in progress</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-bold mb-4">Workload Indicator</h3>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Current Load</span>
            <span className="font-semibold">{Math.round(workloadPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6">
            <div
              className={`h-6 rounded-full transition-all ${workloadPercentage > 80 ? 'bg-red-600' :
                workloadPercentage > 50 ? 'bg-orange-600' :
                  'bg-green-600'
                }`}
              style={{ width: `${workloadPercentage}%` }}
            />
          </div>
        </div>
        <p className="text-sm text-gray-600">
          {workloadPercentage > 80 ? '⚠️ High workload - Consider requesting support' :
            workloadPercentage > 50 ? '⚡ Moderate workload' :
              '✅ Low workload - Ready for new assignments'}
        </p>
      </div>

      <div className="card mt-6">
        <h3 className="text-lg font-bold mb-4">Task Breakdown</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
            <span className="font-semibold">New Assignments</span>
            <span className="text-2xl font-bold text-yellow-600">
              {complaints.filter(c => c.status === 'ASSIGNED').length}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
            <span className="font-semibold">In Progress</span>
            <span className="text-2xl font-bold text-orange-600">
              {complaints.filter(c => c.status === 'IN_PROGRESS').length}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
            <span className="font-semibold">Completed Today</span>
            <span className="text-2xl font-bold text-green-600">
              {complaints.filter(c => {
                if (!c.resolvedDate) return false;
                const today = new Date().toDateString();
                return new Date(c.resolvedDate).toDateString() === today;
              }).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
