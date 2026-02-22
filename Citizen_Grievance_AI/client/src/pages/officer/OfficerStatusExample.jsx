import React, { useState, useEffect } from 'react';
import { officersAPI } from '../../services/apiService';

const OfficerStatus = () => {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOfficers = async () => {
      try {
        setLoading(true);
        const response = await officersAPI.getAll();
        setOfficers(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch officers');
        console.error('Officers fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOfficers();
  }, []);

  const handleStatusChange = async (officerId, newStatus) => {
    try {
      await officersAPI.updateStatus(officerId, { status: newStatus });
      
      // Update local state
      setOfficers(officers.map(officer => 
        officer._id === officerId ? { ...officer, status: newStatus } : officer
      ));
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  if (loading) return <div className="text-center py-8">Loading officers...</div>;
  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Officer Status Management</h1>
      
      <div className="grid gap-4">
        {officers.map((officer) => (
          <div key={officer._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">{officer.name}</h3>
                <p className="text-gray-600">{officer.department} Department</p>
                <p className="text-sm text-gray-500">Badge: {officer.badgeNumber}</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  officer.status === 'FREE' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {officer.status}
                </span>
                <select
                  value={officer.status}
                  onChange={(e) => handleStatusChange(officer._id, e.target.value)}
                  className="border rounded px-3 py-1"
                >
                  <option value="FREE">FREE</option>
                  <option value="BUSY">BUSY</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OfficerStatus;