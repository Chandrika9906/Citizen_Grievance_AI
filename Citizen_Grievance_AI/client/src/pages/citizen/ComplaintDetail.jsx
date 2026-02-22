import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import { complaintAPI } from '../../services/api';
import { User, Phone, Mail, MapPin, Calendar, CheckCircle, XCircle } from 'lucide-react';

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    try {
      const res = await complaintAPI.getById(id);
      setComplaint(res.data);
    } catch (err) {
      console.error(err);
      // alert('Failed to load complaint details');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmResolved = async (isResolved) => {
    if (isResolved) {
      try {
        await complaintAPI.resolve(id, "Citizen confirmed resolution");
        alert('Thank you for confirming! The complaint has been marked as resolved.');
        fetchComplaint(); // Refresh data
        // navigate('/citizen/complaints');
      } catch (err) {
        console.error(err);
        alert('Failed to update status');
      }
    } else {
      alert('We will notify the officer to continue working on this issue.');
      setShowConfirmation(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex justify-center items-center h-64">Loading...</div>
      </PageContainer>
    );
  }

  if (!complaint) {
    return (
      <PageContainer>
        <div className="text-center py-12">Complaint not found</div>
        <Button variant="outline" onClick={() => navigate('/citizen/complaints')}>Back to Complaints</Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">← Back</Button>

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Complaint Details</h1>
        <p className="text-sm text-gray-500">ID: #{complaint._id}</p>
      </div>

      <div className="space-y-4">
        <Card className="p-4">
          <div className="flex justify-between items-start mb-4">
            <StatusBadge status={complaint.status} />
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{new Date(complaint.createdAt).toLocaleString()}</span>
            </div>
          </div>
          <h3 className="font-semibold text-base mb-2">Description</h3>
          <p className="text-sm text-gray-700 mb-4">{complaint.description}</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 flex items-center gap-1">
                <MapPin className="w-4 h-4" />Location:
              </span>
              <p className="font-medium mt-1">
                {complaint.location ||
                  (complaint.latitude && complaint.longitude
                    ? `${complaint.latitude.toFixed(4)}, ${complaint.longitude.toFixed(4)}`
                    : 'Location N/A')}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Department:</span>
              <p className="font-medium mt-1">{complaint.department}</p>
            </div>
            <div>
              <span className="text-gray-600">Priority:</span>
              <p className="font-medium mt-1">Level {complaint.priority}</p>
            </div>
          </div>
        </Card>

        {complaint.officerId && (
          <Card className="p-4 border-2 border-blue-500">
            <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Assigned Officer
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  {complaint.officerId.name ? complaint.officerId.name.split(' ')[0][0] : 'O'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{complaint.officerId.name}</p>
                  <p className="text-xs text-gray-500">{complaint.officerId.department} Department</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{complaint.officerId.email || 'N/A'}</span>
                </div>
                {/* Officer model might not populate phone/email directly unless specified in populate, assume email is there */}
              </div>
            </div>
          </Card>
        )}

        {complaint.status === 'IN_PROGRESS' && complaint.officerId && (
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
            <h3 className="font-semibold text-base mb-3">Problem Resolution Status</h3>
            <p className="text-sm text-gray-700 mb-4">
              Has the officer resolved your complaint? Please confirm below:
            </p>
            {!showConfirmation ? (
              <Button variant="primary" onClick={() => setShowConfirmation(true)}>
                Confirm Resolution Status
              </Button>
            ) : (
              <div className="space-y-3 animate-fade-in">
                <p className="text-sm font-medium text-gray-900">Is your problem solved?</p>
                <div className="flex gap-3">
                  <Button
                    variant="success"
                    onClick={() => handleConfirmResolved(true)}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Yes, Problem Solved
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleConfirmResolved(false)}
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    No, Still Pending
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
