import { useData } from '../../context/DataContext';
import PageContainer from '../../components/layout/PageContainer';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';

export function Officers() {
  const { officers, loading } = useData();

  if (loading) return <div>Loading...</div>;

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Officers</h1>
        <p className="text-sm text-gray-500">Manage officers</p>
      </div>
      <div className="space-y-3">
        {officers.length === 0 ? <p>No officers found.</p> : officers.map(officer => (
          <Card key={officer._id}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-sm">{officer.name}</h3>
                <p className="text-xs text-gray-500">{officer.department} • {officer.email}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${officer.status === 'FREE' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                {officer.status}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}

export function AdminComplaints() {
  const { complaints, loading } = useData();

  if (loading) return <div>Loading...</div>;

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Complaints Management</h1>
        <p className="text-sm text-gray-500">All system complaints</p>
      </div>
      <Card className="mb-4"><p className="text-sm text-gray-600 font-bold">{complaints.length} total complaints</p></Card>

      <div className="space-y-3">
        {complaints.length === 0 ? <p>No complaints found.</p> : complaints.map(complaint => (
          <Card key={complaint._id}>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-sm line-clamp-1">{complaint.description}</h3>
              <StatusBadge status={complaint.status} />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{complaint.department}</span>
              <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}

// AdminAnalytics is now a separate file, but exported here for compatibility if needed. 
// However, App.jsx now imports directly from the file.
// We can remove it or keep a stub.
export function AdminAnalyticsStub() {
  return <div>Use the separate AdminAnalytics component.</div>;
}

export function AdminSettings() {
  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">System settings</p>
      </div>
      <Card><p className="text-sm text-gray-600">System configuration options will appear here.</p></Card>
    </PageContainer>
  );
}
