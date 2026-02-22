import { useAuth } from '../../context/AuthContext';
import PageContainer from '../../components/layout/PageContainer';
import Card from '../../components/ui/Card';

export default function OfficerProfile() {
  const { user } = useAuth();

  if (!user) return <div>Loading...</div>;

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500">Officer information</p>
      </div>

      <Card className="max-w-2xl">
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
              {user.name ? user.name.charAt(0) : 'O'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
              <p className="text-sm text-gray-500">{user.role.toUpperCase()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 uppercase font-semibold">Department</p>
              <p className="font-medium text-gray-900">{user.department}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 uppercase font-semibold">Badge Number</p>
              <p className="font-medium text-gray-900">{user.badge || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 uppercase font-semibold">Email</p>
              <p className="font-medium text-gray-900">{user.email}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 uppercase font-semibold">Phone</p>
              <p className="font-medium text-gray-900">{user.phone || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 uppercase font-semibold">Status</p>
              <p className={`font-medium ${user.status === 'FREE' ? 'text-green-600' : 'text-amber-600'}`}>
                {user.status || 'N/A'}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 uppercase font-semibold">Verified</p>
              <p className="font-medium text-blue-600">
                Yes
              </p>
            </div>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
}
