import { useState, useEffect } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import StatCard from '../../components/ui/StatCard';
import { complaintAPI, officerAPI, departmentAPI } from '../../services/api';
import { FileText, Users, Building2, CheckCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalComplaints: 0,
    activeOfficers: 0,
    totalDepartments: 0,
    resolvedComplaints: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Parallel data fetching for better performance
      const [complaintsRes, officersRes, departmentsRes] = await Promise.all([
        complaintAPI.getStats(),
        officerAPI.getAll(),
        departmentAPI.getAll()
      ]);

      setStats({
        totalComplaints: complaintsRes.data.total,
        activeOfficers: officersRes.data.length,
        totalDepartments: departmentsRes.data.length,
        resolvedComplaints: complaintsRes.data.byStatus.resolved
      });
    } catch (error) {
      console.error("Failed to fetch admin dashboard stats:", error);
    }
  };

  return (
    <PageContainer>
      <div className="mb-6 animate-fadeIn">
        <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">System overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
        <StatCard
          title="Total Complaints"
          value={stats.totalComplaints}
          icon={FileText}
        />
        <StatCard
          title="Officers"
          value={stats.activeOfficers}
          icon={Users}
        />
        <StatCard
          title="Departments"
          value={stats.totalDepartments}
          icon={Building2}
        />
        <StatCard
          title="Resolved"
          value={stats.resolvedComplaints}
          icon={CheckCircle}
        />
      </div>
    </PageContainer>
  );
}
