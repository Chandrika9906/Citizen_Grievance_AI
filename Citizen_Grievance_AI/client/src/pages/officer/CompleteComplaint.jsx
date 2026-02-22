import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { complaintAPI } from '../../services/api';

export default function CompleteComplaint() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [proofImage, setProofImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    try {
      const res = await complaintAPI.getById(id);
      setComplaint(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await complaintAPI.updateStatus(id, {
        status: 'RESOLVED',
        resolutionNotes: remarks
      });
      alert('Complaint marked as completed!');
      navigate('/officer/assigned');
    } catch (err) {
      alert('Failed to update complaint');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!complaint) return <div>Complaint not found</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="btn-secondary mb-4">
        ← Back
      </button>

      <div className="card">
        <h1 className="text-2xl font-bold mb-6">Mark Complaint as Completed</h1>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-bold mb-2">Complaint Details</h3>
          <p className="text-sm text-gray-600 mb-2">{complaint.description}</p>
          <p className="text-sm">
            <span className="font-semibold">Priority:</span> {complaint.priority} |
            <span className="font-semibold"> Department:</span> {complaint.department}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Resolution Remarks</label>
            <textarea
              className="input-field h-32"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Describe the actions taken to resolve this complaint..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Upload Proof Image (Optional)</label>
            <input
              type="file"
              accept="image/*"
              className="input-field"
              onChange={(e) => setProofImage(e.target.files[0])}
            />
          </div>

          <button type="submit" className="btn-primary w-full">
            ✅ Submit & Mark as Completed
          </button>
        </form>
      </div>
    </div>
  );
}
