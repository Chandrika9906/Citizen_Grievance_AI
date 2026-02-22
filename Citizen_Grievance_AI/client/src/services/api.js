import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data, endpoint = 'login') => api.post(`/auth/${endpoint}`, data),
  getProfile: () => api.get('/auth/profile')
};

// Complaint APIs
export const complaintAPI = {
  getAll: () => api.get('/complaints'),
  getById: (id) => api.get(`/complaints/${id}`),
  create: (data) => api.post('/complaints/create', data),
  update: (id, data) => api.put(`/complaints/${id}`, data),
  delete: (id) => api.delete(`/complaints/${id}`),
  assignOfficer: (id, officerId) => api.post(`/complaints/${id}/assign`, { officerId }),
  updateStatus: (id, status, extraData = {}) => api.put(`/complaints/${id}/status`, { status, ...extraData }),
  resolve: (id, notes) => api.put(`/complaints/${id}/status`, { status: "RESOLVED", resolutionNotes: notes }),
  reject: (id, reason) => api.put(`/complaints/${id}/status`, { status: "REJECTED", rejectionReason: reason }),
  getUserComplaints: (userId) => api.get(`/complaints/user/${userId}`),
  getOfficerComplaints: (officerId) => api.get(`/complaints/officer/${officerId}`),
  getStats: () => api.get('/complaints/stats/summary'),
  autoAssign: () => api.post('/complaints/auto-assign'),
  uploadImage: (formData) => api.post('/complaints/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

// Officer APIs
export const officerAPI = {
  getAll: () => api.get('/officers'),
  getById: (id) => api.get(`/officers/${id}`),
  create: (data) => api.post('/officers', data),
  update: (id, data) => api.put(`/officers/${id}`, data),
  delete: (id) => api.delete(`/officers/${id}`),
  updateStatus: (id, status) => api.put(`/officers/${id}/status`, { status }),
  getAvailable: (department) => api.get(`/officers/available/${department}`),
  getStats: (id) => api.get(`/officers/${id}/stats`)
};

// Department APIs
export const departmentAPI = {
  getAll: () => api.get('/departments'),
  getById: (id) => api.get(`/departments/${id}`),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
  getStats: (id) => api.get(`/departments/${id}/stats`)
};

// Notification APIs
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markUnread: (id) => api.put(`/notifications/${id}/unread`),
  delete: (id) => api.delete(`/notifications/${id}`),
  clearAll: () => api.delete('/notifications/clear'),
  getUnreadCount: () => api.get('/notifications/unread/count')
};

// Settings APIs
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data)
};

// Dashboard APIs
export const dashboardAPI = {
  getOfficerStats: (officerId) => api.get(`/dashboard/officer/${officerId}`),
  getAdminStats: () => api.get('/dashboard/admin')
};

// User APIs
export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  exportData: () => api.get('/users/export/data'),
  getCitizenStats: (id) => api.get(`/users/${id}/stats`)
};

// Analytics APIs
export const analyticsAPI = {
  getHeatmap: () => api.get('/analytics/heatmap'),
  getTrends: (period = 'week') => api.get('/analytics/trends', { params: { period } }),
  getDuplicates: (threshold = 0.8) => api.get('/analytics/duplicates', { params: { threshold } }),
  getSLA: (days = 30) => api.get('/analytics/sla', { params: { days } }),
  getDepartmentAnalytics: (dept, days = 30) => api.get(`/analytics/department/${dept}`, { params: { days } })
};

export default api;
