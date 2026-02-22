import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { complaintAPI } from '../../services/api';
import PageContainer from '../../components/layout/PageContainer';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { AlertCircle, CheckCircle, XCircle, User, Phone, MapPin, Calendar, Clock, Loader2 } from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';

export default function AssignedComplaints() {
  const { complaints, refreshData, loading } = useData();
  const { user } = useAuth();
  const [activeComplaint, setActiveComplaint] = useState(null);
  const [activeAction, setActiveAction] = useState(null); // 'ACCEPT', 'REJECT', 'COMPLETE'
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('RESOLVE'); // 'RESOLVE' or 'REJECT'
  const [targetId, setTargetId] = useState(null);
  const [notes, setNotes] = useState('');

  const submitAction = async () => {
    try {
      if (modalType === 'RESOLVE') {
        await complaintAPI.resolve(targetId, notes);
      } else {
        await complaintAPI.reject(targetId, notes);
      }
      await refreshData();
      setShowModal(false);
      setNotes('');
      if (modalType === 'RESOLVE') setActiveComplaint(null);
    } catch (error) {
      console.error("Action failed:", error);
      alert("Failed to submit. Please try again.");
    }
  };

  // Filter complaints for this officer - Robust Match
  const assignedComplaints = complaints.filter(c => {
    const officerId = (c.officerId?._id || c.officerId?.id || c.officerId)?.toString();
    const myId = (user?._id || user?.id)?.toString();
    return officerId === myId && c.status === 'ASSIGNED';
  });

  const activeComplaints = complaints.filter(c => {
    const officerId = (c.officerId?._id || c.officerId?.id || c.officerId)?.toString();
    const myId = (user?._id || user?.id)?.toString();
    return officerId === myId && c.status === 'IN_PROGRESS';
  });

  const handleStatusUpdate = async (complaintId, status) => {
    if (status === 'RESOLVED') {
      setModalType('RESOLVE');
      setTargetId(complaintId);
      setShowModal(true);
      return;
    }
    if (status === 'REJECTED') {
      setModalType('REJECT');
      setTargetId(complaintId);
      setShowModal(true);
      return;
    }

    try {
      setActiveAction(status);
      await complaintAPI.updateStatus(complaintId, status);
      await refreshData();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Action failed. Please try again.");
    } finally {
      setActiveAction(null);
    }
  };

  const statusColors = {
    ASSIGNED: 'text-amber-600 bg-amber-100',
    IN_PROGRESS: 'text-blue-600 bg-blue-100',
    RESOLVED: 'text-green-600 bg-green-100',
    REJECTED: 'text-red-600 bg-red-100'
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex justify-center h-64 items-center">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Complaint Assignment</h1>
            <p className="text-sm text-gray-500">Manage your assigned tasks</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-lg font-semibold ${activeComplaints.length > 0 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
              }`}>
              Status: {activeComplaints.length > 0 ? 'BUSY' : 'FREE'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card className="p-4 bg-amber-50 border-l-4 border-amber-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{assignedComplaints.length}</p>
              <p className="text-xs text-gray-600 font-medium">Pending Acceptance</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-blue-50 border-l-4 border-blue-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeComplaints.length}</p>
              <p className="text-xs text-gray-600 font-medium">Currently Working On</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List of Assignments */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-semibold text-gray-700">New Assignments</h3>
          {assignedComplaints.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">No new assignments.</p>
            </div>
          ) : (
            assignedComplaints.map(complaint => (
              <Card key={complaint._id} className="p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-amber-300">
                <div className="flex justify-between items-start mb-2">
                  <StatusBadge status={complaint.status} />
                  <span className="text-xs text-gray-500">{new Date(complaint.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="font-medium text-gray-900 mb-2 line-clamp-2">{complaint.description}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    className="w-full"
                    onClick={() => handleStatusUpdate(complaint._id, 'IN_PROGRESS')}
                    disabled={activeAction === 'IN_PROGRESS'}
                  >
                    Accept Task
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleStatusUpdate(complaint._id, 'REJECTED')}
                    disabled={activeAction === 'REJECTED'}
                  >
                    Reject
                  </Button>
                </div>
              </Card>
            ))
          )}

          <h3 className="font-semibold text-gray-700 mt-6">Active Tasks</h3>
          {activeComplaints.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No active tasks currently.</p>
          ) : (
            activeComplaints.map(complaint => (
              <Card
                key={complaint._id}
                className={`p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-blue-500 ${activeComplaint?._id === complaint._id ? 'ring-2 ring-blue-400' : ''}`}
                onClick={() => setActiveComplaint(complaint)}
              >
                <div className="flex justify-between items-start mb-2">
                  <StatusBadge status={complaint.status} />
                  <span className="text-xs text-gray-500">P{complaint.priority}</span>
                </div>
                <p className="font-medium text-gray-900 line-clamp-2">{complaint.description}</p>
              </Card>
            ))
          )}
        </div>

        {/* Right Column: Active Task Details */}
        <div className="lg:col-span-2">
          {activeComplaint ? (
            <Card className="p-6 h-full sticky top-4">
              <div className="flex justify-between items-start mb-6 border-b pb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Complaint #{activeComplaint._id.slice(-6)}</h2>
                  <p className="text-sm text-gray-500">
                    Received on {new Date(activeComplaint.createdAt).toLocaleString()}
                  </p>
                </div>
                <StatusBadge status={activeComplaint.status} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Complaint Details</h3>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4">
                    {activeComplaint.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {activeComplaint.location ||
                          (activeComplaint.latitude ? `${activeComplaint.latitude}, ${activeComplaint.longitude}` : 'No location data')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(activeComplaint.createdAt).fromNow ? new Date(activeComplaint.createdAt).fromNow() : "Recent"}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Citizen Info</h3>
                  {activeComplaint.userId ? (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold">
                          {activeComplaint.userId.name ? activeComplaint.userId.name.charAt(0) : 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{activeComplaint.userId.name}</p>
                          <p className="text-xs text-blue-600">Verfied Citizen</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{activeComplaint.userId.phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <User className="w-4 h-4 text-gray-500" />
                        <span>{activeComplaint.userId.email || 'N/A'}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">User information not available</p>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Actions</h3>
                <div className="flex gap-4">
                  <Button
                    variant="success"
                    size="lg"
                    className="flex-1"
                    onClick={() => handleStatusUpdate(activeComplaint._id, 'RESOLVED')}
                    disabled={activeAction === 'RESOLVED'}
                  >
                    {activeAction === 'RESOLVED' ? <Loader2 className="animate-spin" /> : <CheckCircle className="mr-2" />}
                    Mark as Resolved
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    onClick={() => setActiveComplaint(null)}
                  >
                    Close View
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 p-12 text-center text-gray-400">
              <User size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-medium">Select a task to view details</p>
              <p className="text-sm mt-1">Choose from the list on the left</p>
            </div>
          )}
        </div>
      </div>


      {/* Action Modal for Resolve/Reject */}
      {
        showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {modalType === 'RESOLVE' ? 'Confirm Resolution' : 'Reject Assignment'}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {modalType === 'RESOLVE'
                  ? 'Please verify the work done and add resolution notes.'
                  : 'Please provide a reason for rejecting this assignment.'}
              </p>

              <textarea
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px] text-sm"
                placeholder={modalType === 'RESOLVE' ? 'e.g. Pothole filled and leveled...' : 'e.g. Incorrect jurisdiction...'}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                autoFocus
              />

              <div className="flex gap-3 mt-6 justify-end">
                <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button
                  variant={modalType === 'RESOLVE' ? 'success' : 'danger'}
                  onClick={submitAction}
                  disabled={!notes.trim()}
                >
                  {modalType === 'RESOLVE' ? 'Complete Task' : 'Reject Task'}
                </Button>
              </div>
            </div>
          </div>
        )
      }
    </PageContainer >
  );
}
