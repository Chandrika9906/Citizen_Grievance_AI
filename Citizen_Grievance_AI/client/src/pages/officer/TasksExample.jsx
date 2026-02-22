import React, { useState, useEffect } from 'react';
import { complaintsAPI } from '../../services/apiService';

const Tasks = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');

  // Replace with actual officer ID from auth context
  const officerId = "674a123456789012345678ab";

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const response = await complaintsAPI.getByOfficer(officerId);
        setComplaints(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch tasks');
        console.error('Tasks fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [officerId]);

  const handleStatusUpdate = async (complaintId, newStatus) => {
    try {
      await complaintsAPI.updateStatus(complaintId, { status: newStatus });
      
      // Update local state
      setComplaints(complaints.map(complaint => 
        complaint._id === complaintId ? { ...complaint, status: newStatus } : complaint
      ));
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    if (filter === 'ALL') return true;
    return complaint.status === filter;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-gray-100 text-gray-800';
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="text-center py-8">Loading tasks...</div>;
  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Tasks</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="ALL">All Tasks</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filteredComplaints.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No tasks found</div>
        ) : (
          filteredComplaints.map((complaint) => (
            <div key={complaint._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{complaint.title}</h3>
                  <p className="text-gray-600 mb-2">{complaint.description}</p>
                  <p className="text-sm text-gray-500">📍 {complaint.location}</p>
                </div>
                <div className="flex flex-col space-y-2">
                  <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(complaint.priority)}`}>
                    {complaint.priority}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(complaint.status)}`}>
                    {complaint.status}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Due: {new Date(complaint.dueDate).toLocaleDateString()}
                </div>
                <div className="flex space-x-2">
                  {complaint.status === 'ASSIGNED' && (
                    <button
                      onClick={() => handleStatusUpdate(complaint._id, 'IN_PROGRESS')}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Start Work
                    </button>
                  )}
                  {complaint.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => handleStatusUpdate(complaint._id, 'RESOLVED')}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Tasks;