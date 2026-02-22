import { useData } from '../../context/DataContext';
import PageContainer from '../../components/layout/PageContainer';
import Card from '../../components/ui/Card';

export default function Departments() {
  const { departments, loading } = useData();

  if (loading) return <div>Loading...</div>;

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Departments</h1>
        <p className="text-sm text-gray-500">Manage departments</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {departments.map(dept => (
          <Card key={dept._id || dept.id}>
            <h3 className="font-semibold text-sm mb-1">{dept.name}</h3>
            <p className="text-xs text-gray-500">{dept.description}</p>
            {/* Backend currently returns basic department info. If we need counts, backend should be updated. */}
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
