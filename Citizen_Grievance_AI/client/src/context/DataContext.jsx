import { createContext, useContext, useState, useEffect } from 'react';
import { complaintAPI, officerAPI, departmentAPI, notificationAPI, userAPI } from '../services/api';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from backend on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (!user) return;

      console.log('🔄 [fetchData] Syncing data for:', user._id || user.id, 'Role:', user.role);

      const promises = [
        // Role-based fetching: Citizens fetch their specific records, others fetch all
        (user.role === 'citizen' ? complaintAPI.getUserComplaints(user._id || user.id) : complaintAPI.getAll()).catch(err => {
          console.error('❌ [fetchData] Complaints sync failed:', err);
          return { data: [] };
        }),
        officerAPI.getAll().catch(() => ({ data: [] })),
        departmentAPI.getAll().catch(() => ({ data: [] })),
        notificationAPI.getAll().catch(() => ({ data: [] }))
      ];

      const [complaintsRes, officersRes, departmentsRes, notificationsRes] = await Promise.all(promises);

      // Handle varied response structures (array vs paginated object)
      console.log('🔍 [fetchData] RAW Response:', complaintsRes.data);
      let complaintsData = [];
      if (Array.isArray(complaintsRes.data)) {
        complaintsData = complaintsRes.data;
      } else if (complaintsRes.data && complaintsRes.data.complaints) {
        complaintsData = complaintsRes.data.complaints;
      } else if (complaintsRes.data && complaintsRes.data.data) {
        complaintsData = Array.isArray(complaintsRes.data.data) ? complaintsRes.data.data : [];
      }

      console.log(`✅ [fetchData] Processed Array Length: ${complaintsData.length}`);
      if (complaintsData.length > 0) {
        console.log('✅ [fetchData] Sample Complaint:', complaintsData[0]);
      } else {
        console.warn('⚠️ [fetchData] Empty complaints array! Check API response structure.');
      }
      setComplaints(complaintsData);
      setOfficers(Array.isArray(officersRes.data) ? officersRes.data : []);
      setDepartments(Array.isArray(departmentsRes.data) ? departmentsRes.data : []);
      setNotifications(Array.isArray(notificationsRes.data) ? notificationsRes.data : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitComplaint = async (complaintData) => {
    try {
      const response = await complaintAPI.create(complaintData);
      await fetchData();
      return response.data;
    } catch (error) {
      console.error('Error submitting complaint:', error);
      throw error;
    }
  };

  const assignComplaint = async (complaintId, department) => {
    try {
      const availableOfficers = officers.filter(o => o.status === 'FREE' && o.department === department);

      if (availableOfficers.length === 0) return null;

      const officer = availableOfficers[0];
      await complaintAPI.assignOfficer(complaintId, officer._id);
      await officerAPI.updateStatus(officer._id, 'BUSY');
      await fetchData();
      return officer;
    } catch (error) {
      console.error('Error assigning complaint:', error);
      throw error;
    }
  };

  const acceptComplaint = async (complaintId) => {
    try {
      await complaintAPI.updateStatus(complaintId, 'IN_PROGRESS');
      await fetchData();
    } catch (error) {
      console.error('Error accepting complaint:', error);
      throw error;
    }
  };

  const rejectComplaint = async (complaintId) => {
    try {
      await complaintAPI.updateStatus(complaintId, 'REJECTED');
      await fetchData();
    } catch (error) {
      console.error('Error rejecting complaint:', error);
      throw error;
    }
  };

  const resolveComplaint = async (complaintId, notes = '') => {
    try {
      await complaintAPI.resolve(complaintId, notes);
      await fetchData();
    } catch (error) {
      console.error('Error resolving complaint:', error);
      throw error;
    }
  };

  const markOfficerFree = async (officerId) => {
    try {
      await officerAPI.updateStatus(officerId, 'FREE');
      await fetchData();
    } catch (error) {
      console.error('Error updating officer status:', error);
      throw error;
    }
  };

  const markNotificationRead = async (notificationId) => {
    try {
      await notificationAPI.markRead(notificationId);
      await fetchData();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  };

  const triggerAutoAssign = async () => {
    try {
      const response = await complaintAPI.autoAssign();
      await fetchData();
      return response.data;
    } catch (error) {
      console.error('Error triggering auto-assign:', error);
      throw error;
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationAPI.delete(notificationId);
      await fetchData();
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  };

  return (
    <DataContext.Provider value={{
      complaints,
      officers,
      departments,
      notifications,
      loading,
      submitComplaint,
      assignComplaint,
      acceptComplaint,
      rejectComplaint,
      resolveComplaint,
      markOfficerFree,
      markNotificationRead,
      triggerAutoAssign,
      deleteNotification,
      refreshData: fetchData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
