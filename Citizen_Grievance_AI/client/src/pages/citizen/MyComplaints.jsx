import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import PageContainer from '../../components/layout/PageContainer';
import Input from '../../components/ui/Input';
import ComplaintCard from '../../components/complaints/ComplaintCard';
import { Search } from 'lucide-react';

export default function MyComplaints() {
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const { complaints, loading } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const filters = ['ALL', 'WAITING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];

  // Filter complaints for current user - robust matching
  const userComplaints = complaints.filter(c => {
    const complUserId = (c.userId?._id || c.userId?.id || c.userId || c.citizenId)?.toString();
    const currentUserId = (user?._id || user?.id)?.toString();
    return complUserId === currentUserId;
  });

  const filtered = userComplaints.filter(c => {
    const matchesFilter = filter === 'ALL' || c.status === filter;
    const matchesSearch = c.description?.toLowerCase().includes(search.toLowerCase()) ||
      c.location?.toLowerCase().includes(search.toLowerCase()) ||
      c.department?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading complaints...</div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">My Complaints</h1>
        <p className="text-sm text-gray-500">Track and manage your submitted complaints</p>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search complaints..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {filtered.map(complaint => (
          <ComplaintCard
            key={complaint._id}
            complaint={complaint}
            onView={(id) => navigate(`/citizen/complaint/${id}`)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 glass rounded-lg">
          <p className="text-gray-500">
            {search ? 'No complaints match your search' : 'No complaints found'}
          </p>
        </div>
      )}
    </PageContainer>
  );
}
