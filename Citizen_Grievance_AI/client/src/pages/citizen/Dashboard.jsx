import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/ui/StatCard';
import ComplaintCard from '../../components/complaints/ComplaintCard';
import PageContainer from '../../components/layout/PageContainer';
import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const { complaints = [], loading } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Filter complaints for current user - robust matching
  // Filter complaints for current user - robust matching
  const userComplaints = Array.isArray(complaints)
    ? complaints.filter(c => {
      if (!user) return false;
      const complUserId = (c.userId?._id || c.userId?.id || c.userId || c.citizenId)?.toString();
      const currentUserId = (user._id || user.id)?.toString();

      // Debug log (can be removed later)
      // console.log(`[Dashboard] Checking ${complUserId} vs ${currentUserId}`);

      const isMatch = complUserId === currentUserId;
      if (!isMatch && complaints.indexOf(c) < 3) {
        console.log(`[Dashboard] ❌ NO MATCH: ComplaintID=${c._id} OwnedBy=${complUserId} CurrentUser=${currentUserId}`);
      }

      return isMatch;
    })
    : [];

  const stats = {
    total: userComplaints.length,
    pending: userComplaints.filter(c => c.status === 'WAITING').length,
    inProgress: userComplaints.filter(c => c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED').length,
    resolved: userComplaints.filter(c => c.status === 'RESOLVED').length
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of your complaints</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard title="Total" value={stats.total} icon={FileText} />
        <StatCard title="Pending" value={stats.pending} icon={Clock} />
        <StatCard title="In Progress" value={stats.inProgress} icon={AlertCircle} />
        <StatCard title="Resolved" value={stats.resolved} icon={CheckCircle} />
      </div>

      <div className="glass rounded-lg shadow-md p-4">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Recent Complaints</h2>
        {userComplaints.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No complaints yet. Submit your first complaint to get started.
          </div>
        ) : (
          <div className="grid gap-3">
            {userComplaints.slice(0, 5).map(complaint => (
              <ComplaintCard
                key={complaint._id}
                complaint={complaint}
                onView={(id) => navigate(`/citizen/complaints/${id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
