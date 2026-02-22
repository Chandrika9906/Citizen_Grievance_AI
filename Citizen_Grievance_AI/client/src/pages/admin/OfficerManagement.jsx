import { useState, useEffect } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { officerAPI, complaintAPI } from '../../services/api';
import { User, Phone, Mail, Shield, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function OfficerManagement() {
  const [officers, setOfficers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const departments = ['ALL', 'Roads', 'Water', 'Electricity', 'Sanitation', 'Health'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [officersRes, complaintsRes] = await Promise.all([
        officerAPI.getAll(),
        complaintAPI.getAll() // We might want to filter this on backend, but for now client-side is fine for small scale
      ]);

      setOfficers(Array.isArray(officersRes.data) ? officersRes.data : []);
      // Filter for WAITING status for pending complaints
      const allComplaints = Array.isArray(complaintsRes.data) ? complaintsRes.data : [];
      const pending = allComplaints.filter(c => c.status === 'WAITING');
      setComplaints(pending);
    } catch (error) {
      console.error("Failed to fetch officer management data", error);
    } finally {
      setLoading(false);
    }
  };

  const freeOfficers = officers.filter(o => o.status === 'FREE');
  const busyOfficers = officers.filter(o => o.status === 'BUSY');

  const assignTask = async (complaintId, department) => {
    // Find a free officer in the department
    const availableOfficer = officers.find(o => o.status === 'FREE' && o.department === department);

    if (availableOfficer) {
      try {
        await complaintAPI.assignOfficer(complaintId, availableOfficer._id);

        // Optimistic UI update
        setOfficers(prev => prev.map(o =>
          o._id === availableOfficer._id
            ? { ...o, status: 'BUSY', assigned: (o.assigned || 0) + 1 }
            : o
        ));
        setComplaints(prev => prev.filter(c => c._id !== complaintId));
        alert(`Task assigned to ${availableOfficer.name}`);
      } catch (error) {
        console.error("Failed to assign task", error);
        alert("Failed to assign task. Please try again.");
      }
    } else {
      alert('No free officer available in this department');
    }
  };

  const markFree = async (officerId) => {
    try {
      await officerAPI.updateStatus(officerId, 'FREE');

      setOfficers(prev => prev.map(o =>
        o._id === officerId
          ? { ...o, status: 'FREE' }
          : o
      ));
    } catch (error) {
      console.error("Failed to update officer status", error);
    }
  };

  const filteredOfficers = selectedDept === 'ALL'
    ? officers
    : officers.filter(o => o.department === selectedDept);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <PageContainer>
      <div className="mb-6 animate-fadeIn">
        <h1 className="text-xl font-semibold text-gray-900">Officer Management</h1>
        <p className="text-sm text-gray-500">Monitor officer status and assign tasks</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 animate-fadeIn">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{freeOfficers.length}</p>
              <p className="text-xs text-gray-500">Free Officers</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{busyOfficers.length}</p>
              <p className="text-xs text-gray-500">Busy Officers</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{complaints.length}</p>
              <p className="text-xs text-gray-500">Pending Tasks</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {departments.map(dept => (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${selectedDept === dept
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
              : 'glass text-gray-700 hover:bg-gray-100'
              }`}
          >
            {dept}
          </button>
        ))}
      </div>

      {complaints.length > 0 && (
        <Card className="p-4 mb-4 animate-slideIn">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Complaints (Auto-Assign)</h3>
          <div className="space-y-3">
            {complaints.map(complaint => (
              <div key={complaint._id} className="glass p-3 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{complaint.description}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Priority: {complaint.priority} • Department: {complaint.department}
                  </p>
                </div>
                <Button variant="primary" onClick={() => assignTask(complaint._id, complaint.department)}>
                  Auto-Assign
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-4 animate-fadeIn">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Officers List</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Officer</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Department</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Assigned</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Completed</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOfficers.map(officer => (
                <tr key={officer._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {officer.name ? officer.name.split(' ')[0][0] : 'O'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{officer.name}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            {officer.badge || 'OFF-NEW'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {officer.email}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {officer.department}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${officer.status === 'FREE'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                      }`}>
                      {officer.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-sm font-semibold text-gray-900">{officer.assigned || 0}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-sm font-semibold text-gray-900">{officer.completed || 0}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {officer.status === 'BUSY' && (
                      <Button variant="outline" onClick={() => markFree(officer._id)}>
                        Mark Free
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PageContainer>
  );
}
