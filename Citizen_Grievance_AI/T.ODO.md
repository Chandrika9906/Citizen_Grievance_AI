# Backend Implementation TODO List

## Phase 1: New Models (Create 3 files)
- [x] 1.1 Create Notification model (`server/models/Notification.js`)
- [x] 1.2 Create Settings model (`server/models/Settings.js`)
- [x] 1.3 Create Department model (`server/models/Department.js`)

## Phase 2: New Routes (Create 5 files)
- [x] 2.1 Create notificationRoutes.js
- [x] 2.2 Create settingsRoutes.js
- [x] 2.3 Create departmentRoutes.js
- [x] 2.4 Create analyticsRoutes.js
- [x] 2.5 Create userRoutes.js

## Phase 3: Updates to Existing Routes
- [ ] 3.1 Update complaintRoutes.js (add filters, accept/reject, analytics)
- [ ] 3.2 Update officerRoutes.js (workload, history, verify)
- [ ] 3.3 Update authRoutes.js (export data, delete account)

## Phase 4: Update index.js
- [ ] 4.1 Register new routes in index.js

## Phase 5: Update Client API Service
- [ ] 5.1 Update client/src/services/api.js with new API functions
