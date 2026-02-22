# Backend Implementation Plan for Citizen Grievance AI System

## Overview
This document outlines the backend implementation needed to connect all frontend pages with MongoDB.

---

## Phase 1: New Models to Create

### 1. Notification Model
Location: `server/models/Notification.js`
Fields:
- userId (ref: User)
- type (enum: 'success', 'warning', 'info', 'error')
- title
- message
- complaintId (optional ref: Complaint)
- read (Boolean, default: false)
- createdAt

### 2. Settings Model
Location: `server/models/Settings.js`
Fields:
- userId (ref: User, unique)
- emailNotifications (Boolean, default: true)
- pushNotifications (Boolean, default: true)
- smsNotifications (Boolean, default: false)
- complaintUpdates (Boolean, default: true)
- systemUpdates (Boolean, default: false)
- language (String, default: 'en')
- autoSave (Boolean, default: true)
- twoFactor (Boolean, default: false)
- darkMode (Boolean, default: false)

### 3. Department Model
Location: `server/models/Department.js`
Fields:
- name (String, unique)
- description
- headName
- headEmail
- phone
- officerCount (Number)
- activeComplaints (Number)

---

## Phase 2: New Routes to Create

### 1. notificationRoutes.js
Location: `server/routes/notificationRoutes.js`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/notifications | Get all notifications for user |
| GET | /api/notifications/unread-count | Get unread count |
| PUT | /api/notifications/:id/read | Mark as read |
| PUT | /api/notifications/:id/unread | Mark as unread |
| PUT | /api/notifications/mark-all-read | Mark all as read |
| DELETE | /api/notifications/:id | Delete notification |
| DELETE | /api/notifications/clear-all | Clear all notifications |

### 2. settingsRoutes.js
Location: `server/routes/settingsRoutes.js`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/settings | Get user settings |
| PUT | /api/settings | Update user settings |

### 3. departmentRoutes.js
Location: `server/routes/departmentRoutes.js`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/departments | Get all departments |
| GET | /api/departments/:id | Get department by ID |
| POST | /api/departments | Create department |
| PUT | /api/departments/:id | Update department |
| DELETE | /api/departments/:id | Delete department |
| GET | /api/departments/:id/stats | Get department statistics |

### 4. analyticsRoutes.js
Location: `server/routes/analyticsRoutes.js`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/analytics/heatmap | Get hotspot data for heatmap |
| GET | /api/analytics/trends | Get complaint trend data |
| GET | /api/analytics/duplicates | Get duplicate complaints |
| GET | /api/analytics/sla | Get SLA compliance data |
| GET | /api/analytics/department/:dept | Get department analytics |

### 5. userRoutes.js (for citizen operations)
Location: `server/routes/userRoutes.js`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users | Get all users (admin only) |
| GET | /api/users/:id | Get user by ID |
| DELETE | /api/users/:id | Delete user account |
| POST | /api/users/export-data | Export user data |

---

## Phase 3: Updates to Existing Routes

### 1. complaintRoutes.js Updates
- Add: GET /api/complaints (with filters: status, department, date range)
- Add: PUT /api/complaints/:id (update complaint details)
- Add: DELETE /api/complaints/:id (delete complaint)
- Add: POST /api/complaints/:id/accept (officer accepts)
- Add: POST /api/complaints/:id/reject (officer rejects)
- Add: GET /api/complaints/analytics/heatmap (for heatmap)
- Add: GET /api/complaints/analytics/trends (for trends)
- Add: GET /api/complaints/analytics/duplicates (for duplicates)
- Add: GET /api/complaints/analytics/sla (for SLA monitoring)

### 2. officerRoutes.js Updates
- Add: PUT /api/officers/:id (update officer details)
- Add: DELETE /api/officers/:id (delete officer)
- Add: GET /api/officers/:id/workload (get officer workload)
- Add: GET /api/officers/:id/history (get resolved complaints)
- Add: PUT /api/officers/:id/verify (verify officer)
- Add: PUT /api/officers/:id/verify (verify officer)

### 3. authRoutes.js Updates
- Add: POST /api/auth/export-data (export user data)
- Add: DELETE /api/auth/delete-account (delete account)

---

## Phase 4: Update index.js

Add new route registrations:
```
javascript
const notificationRoutes = require("./routes/notificationRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const userRoutes = require("./routes/userRoutes");

app.use("/api/notifications", notificationRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/users", userRoutes);
```

---

## Phase 5: Update Client API Service

Location: `client/src/services/api.js`

Add new API functions:
```
javascript
// Notification APIs
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAsUnread: (id) => api.put(`/notifications/${id}/unread`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  delete: (id) => api.delete(`/notifications/${id}`),
  clearAll: () => api.delete('/notifications/clear-all')
};

// Settings APIs
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data)
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

// Analytics APIs
export const analyticsAPI = {
  getHeatmap: () => api.get('/analytics/heatmap'),
  getTrends: () => api.get('/analytics/trends'),
  getDuplicates: () => api.get('/analytics/duplicates'),
  getSLA: () => api.get('/analytics/sla'),
  getDepartmentAnalytics: (dept) => api.get(`/analytics/department/${dept}`)
};

// User APIs
export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  delete: (id) => api.delete(`/users/${id}`),
  exportData: () => api.post('/users/export-data')
};
```

---

## Implementation Order

1. Create new models (Notification, Settings, Department)
2. Create new route files
3. Update index.js to register new routes
4. Update client API service
5. Test all endpoints

---

## Notes

- All routes should use JWT authentication where needed
- Add proper error handling
- Add input validation
- Consider pagination for list endpoints
- Add rate limiting for production
