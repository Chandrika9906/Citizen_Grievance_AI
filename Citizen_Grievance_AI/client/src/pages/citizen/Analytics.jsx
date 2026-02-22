import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import PageContainer from '../../components/layout/PageContainer';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import { FileText, CheckCircle, Clock, TrendingUp } from 'lucide-react';

export default function Analytics() {
  const { complaints = [] } = useData();
  const { user } = useAuth();

  // Filter complaints for current user - robust matching
  const userComplaints = Array.isArray(complaints)
    ? complaints.filter(c => {
      const complUserId = (c.userId?._id || c.userId?.id || c.userId || c.citizenId)?.toString();
      const currentUserId = (user?._id || user?.id)?.toString();
      return complUserId === currentUserId;
    })
    : [];

  const resolvedComplaints = userComplaints.filter(c => c.status === 'RESOLVED' && c.resolvedDate);
  const resolutionTimes = resolvedComplaints.map(c => new Date(c.resolvedDate) - new Date(c.createdAt));
  const totalResTime = resolutionTimes.reduce((a, b) => a + b, 0);
  const avgResTime = resolvedComplaints.length ? (totalResTime / resolvedComplaints.length) / (1000 * 60 * 60 * 24) : 0;
  const fastestResTime = resolutionTimes.length ? (Math.min(...resolutionTimes) / (1000 * 60 * 60 * 24)) : 0;

  const stats = {
    total: userComplaints.length,
    resolved: userComplaints.filter(c => c.status === 'RESOLVED').length,
    pending: userComplaints.filter(c => c.status === 'WAITING').length + userComplaints.filter(c => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS').length,
    avgResolution: `${avgResTime.toFixed(1)}d`
  };

  const priorityCounts = {
    high: userComplaints.filter(c => c.priority >= 3).length,
    medium: userComplaints.filter(c => c.priority === 2).length,
    low: userComplaints.filter(c => c.priority <= 1).length
  };

  const resolutionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

  const getPercent = (count) => stats.total > 0 ? (count / stats.total) * 100 : 0;
  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500">Your complaint statistics and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard title="Total Complaints" value={stats.total} icon={FileText} />
        <StatCard title="Resolved" value={stats.resolved} icon={CheckCircle} />
        <StatCard title="Pending" value={stats.pending} icon={Clock} />
        <StatCard title="Avg Resolution" value={stats.avgResolution} icon={TrendingUp} />
      </div>

      <Card className="p-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Breakdown</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">High</span>
              <span className="text-sm font-semibold text-gray-900">{priorityCounts.high}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${getPercent(priorityCounts.high)}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Medium</span>
              <span className="text-sm font-semibold text-gray-900">{priorityCounts.medium}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: `${getPercent(priorityCounts.medium)}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Low</span>
              <span className="text-sm font-semibold text-gray-900">{priorityCounts.low}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${getPercent(priorityCounts.low)}%` }}></div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trust Score</h3>
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">85</span>
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-900 mt-4">Excellent Standing</p>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resolution Rate</h3>
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-green-500 flex items-center justify-center">
              <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">{resolutionRate}%</span>
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-900 mt-4">{stats.resolved} of {stats.total} Resolved</p>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
              <span className="text-xs text-gray-700">Fastest Resolution</span>
              <span className="text-sm font-semibold text-blue-600">{fastestResTime.toFixed(1)} days</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
              <span className="text-xs text-gray-700">Success Rate</span>
              <span className="text-sm font-semibold text-green-600">96%</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
              <span className="text-xs text-gray-700">Most Active</span>
              <span className="text-sm font-semibold text-purple-600">June</span>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
