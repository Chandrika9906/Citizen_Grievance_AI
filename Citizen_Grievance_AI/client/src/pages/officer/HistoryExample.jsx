import React, { useState, useEffect } from 'react';
import { complaintsAPI } from '../../services/apiService';

const History = () => {
  const [resolvedComplaints, setResolvedComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Replace with actual officer ID from auth context
  const officerId = "674a123456789012345678ab";

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await complaintsAPI.getByOfficer(officerId);
        
        // Filter only resolved complaints
        const resolved = response.data.filter(complaint => complaint.status === 'RESOLVED');
        setResolvedComplaints(resolved);
        setError(null);
      } catch (err) {
        setError('Failed to fetch history');
        console.error('History fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [officerId]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="text-center py-8">Loading history...</div>;
  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Complaint History</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Resolved Complaints</h2>
          <p className="text-gray-600">Total resolved: {resolvedComplaints.length}</p>
        </div>
        
        {resolvedComplaints.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No resolved complaints yet</div>
        ) : (
          <div className="space-y-4">
            {resolvedComplaints.map((complaint) => (
              <div key={complaint._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold">{complaint.title}</h3>
                    <p className="text-gray-600 text-sm">{complaint.description}</p>
                    <p className="text-xs text-gray-500 mt-1">📍 {complaint.location}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(complaint.priority)}`}>
                    {complaint.priority}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <div>
                    Created: {new Date(complaint.createdAt).toLocaleDateString()}
                  </div>
                  <div>
                    Resolved: {new Date(complaint.updatedAt).toLocaleDateString()}
                  </div>
                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                    ✅ RESOLVED
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;