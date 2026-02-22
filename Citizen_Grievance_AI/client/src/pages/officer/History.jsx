import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import PageContainer from '../../components/layout/PageContainer';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import { CheckCircle, Calendar, MapPin } from 'lucide-react';

export default function History() {
  const { complaints, loading } = useData();
  const { user } = useAuth();

  if (loading) return <div>Loading...</div>;

  // Filter tasks resolved by this officer
  const history = complaints.filter(c =>
    c.officerId && (c.officerId._id === user?._id || c.officerId === user?._id) &&
    c.status === 'RESOLVED'
  );

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Task History</h1>
        <p className="text-sm text-gray-500">Completed assignments</p>
      </div>

      <div className="space-y-4">
        {history.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No history found</h3>
            <p className="mt-1 text-sm text-gray-500">You haven't resolved any complaints yet.</p>
          </div>
        ) : (
          history.map(item => (
            <Card key={item._id} className="bg-gray-50 opacity-90 hover:opacity-100 transition-opacity">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-sm line-through text-gray-500 decoration-purple-500">{item.description}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {item.location || 'Location N/A'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      Resolved: {item.resolvedDate ? new Date(item.resolvedDate).toLocaleDateString() : new Date(item.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <StatusBadge status={item.status} />
              </div>
              {item.resolutionNotes && (
                <div className="mt-2 text-xs text-gray-600 bg-white p-2 rounded border border-gray-200">
                  <strong>Notes:</strong> {item.resolutionNotes}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </PageContainer>
  );
}
