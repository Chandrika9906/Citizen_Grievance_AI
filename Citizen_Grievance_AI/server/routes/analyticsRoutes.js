const express = require("express");
const Complaint = require("../models/Complaint");
const User = require("../models/User");

const router = express.Router();

/* ======================================================
   VERIFY TOKEN MIDDLEWARE
====================================================== */
const verifyToken = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = header.split(" ")[1];

  try {
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

/* ======================================================
   VERIFY ADMIN MIDDLEWARE
====================================================== */
const verifyAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

/* ======================================================
   GET HEATMAP DATA
====================================================== */
router.get("/heatmap", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const complaints = await Complaint.find({
      latitude: { $exists: true, $ne: null },
      longitude: { $exists: true, $ne: null }
    }).select('latitude longitude department priority status createdAt');

    // Group by location clusters
    const heatmapData = complaints.map(c => ({
      lat: c.latitude,
      lng: c.longitude,
      intensity: c.priority || 1,
      department: c.department,
      status: c.status
    }));

    res.json(heatmapData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   GET TREND DATA
====================================================== */
router.get("/trends", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    
    let groupBy;
    if (period === 'day') {
      groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    } else if (period === 'month') {
      groupBy = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
    } else {
      // Week - get week number
      groupBy = { 
        $concat: [
          { $dateToString: { format: "%Y", date: "$createdAt" } },
          "-W",
          { $week: "$createdAt" }
        ]
      };
    }

    const trends = await Complaint.aggregate([
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ["$status", "RESOLVED"] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $ne: ["$status", "RESOLVED"] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 52 }
    ]);

    // Generate mock predictions (in production, this would use ML)
    const predictions = trends.map(t => ({
      period: t._id,
      actual: t.count,
      predicted: t.count + Math.floor(Math.random() * 5) - 2,
      trend: 'stable'
    }));

    res.json({ predictions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   GET DUPLICATE COMPLAINTS
====================================================== */
router.get("/duplicates", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { threshold = 0.8 } = req.query;
    
    // Find complaints with similar descriptions (simplified duplicate detection)
    const complaints = await Complaint.find({
      status: { $nin: ['RESOLVED', 'REJECTED'] }
    }).select('description department status createdAt location').limit(500);

    const duplicates = [];
    const processed = new Set();

    for (let i = 0; i < complaints.length; i++) {
      if (processed.has(complaints[i]._id.toString())) continue;
      
      const similar = [];
      
      for (let j = i + 1; j < complaints.length; j++) {
        if (processed.has(complaints[j]._id.toString())) continue;
        
        // Simple similarity check (in production, use more sophisticated NLP)
        const desc1 = complaints[i].description.toLowerCase();
        const desc2 = complaints[j].description.toLowerCase();
        
        // Check for common words
        const words1 = new Set(desc1.split(' ').filter(w => w.length > 3));
        const words2 = new Set(desc2.split(' ').filter(w => w.length > 3));
        
        let commonWords = 0;
        words1.forEach(w => {
          if (words2.has(w)) commonWords++;
        });
        
        const similarity = words1.size > 0 ? commonWords / Math.min(words1.size, words2.size) : 0;
        
        if (similarity >= threshold) {
          similar.push({
            id: complaints[j]._id,
            description: complaints[j].description,
            similarity: Math.round(similarity * 100)
          });
          processed.add(complaints[j]._id.toString());
        }
      }
      
      if (similar.length > 0) {
        duplicates.push({
          primary: {
            id: complaints[i]._id,
            description: complaints[i].description,
            department: complaints[i].department,
            status: complaints[i].status
          },
          similar
        });
        processed.add(complaints[i]._id.toString());
      }
    }

    res.json({ duplicates: duplicates.slice(0, 50) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   GET SLA COMPLIANCE DATA
====================================================== */
router.get("/sla", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // SLA thresholds by priority (in days)
    const slaThresholds = {
      5: 1,  // Critical - 1 day
      4: 2,  // High - 2 days
      3: 5,  // Medium - 5 days
      2: 7,  // Low - 7 days
      1: 14  // Very Low - 14 days
    };

    const complaints = await Complaint.find({
      createdAt: { $gte: startDate },
      status: { $in: ['RESOLVED', 'IN_PROGRESS', 'ASSIGNED'] }
    }).select('priority status createdAt resolvedDate department');

    let total = 0;
    let met = 0;
    let breached = 0;
    let pending = 0;

    const byDepartment = {};
    const byPriority = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const priorityMet = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    complaints.forEach(c => {
      const threshold = slaThresholds[c.priority] || 7;
      const createdDate = new Date(c.createdAt);
      
      if (c.status === 'RESOLVED') {
        const resolvedDate = new Date(c.resolvedDate);
        const daysTaken = Math.ceil((resolvedDate - createdDate) / (1000 * 60 * 60 * 24));
        
        total++;
        if (daysTaken <= threshold) {
          met++;
          priorityMet[c.priority] = (priorityMet[c.priority] || 0) + 1;
        } else {
          breached++;
        }
      } else {
        pending++;
        const daysPending = Math.ceil((new Date() - createdDate) / (1000 * 60 * 60 * 24));
        if (daysPending > threshold) {
          breached++;
        }
      }

      // Group by department
      if (!byDepartment[c.department]) {
        byDepartment[c.department] = { total: 0, met: 0, breached: 0 };
      }
      byDepartment[c.department].total++;
    });

    const complianceRate = total > 0 ? Math.round((met / total) * 100) : 0;

    res.json({
      summary: {
        total,
        met,
        breached,
        pending,
        complianceRate
      },
      byDepartment,
      byPriority,
      slaThresholds
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   GET DEPARTMENT ANALYTICS
====================================================== */
router.get("/department/:dept", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { dept } = req.params;
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const complaints = await Complaint.find({
      department: dept,
      createdAt: { $gte: startDate }
    });

    const total = complaints.length;
    const resolved = complaints.filter(c => c.status === 'RESOLVED').length;
    const pending = complaints.filter(c => ['WAITING', 'ASSIGNED', 'IN_PROGRESS'].includes(c.status)).length;
    const rejected = complaints.filter(c => c.status === 'REJECTED').length;

    // Average resolution time
    const resolvedComplaints = complaints.filter(c => c.status === 'RESOLVED' && c.resolvedDate);
    let avgResolutionDays = 0;
    if (resolvedComplaints.length > 0) {
      const totalDays = resolvedComplaints.reduce((sum, c) => {
        const days = Math.ceil((new Date(c.resolvedDate) - new Date(c.createdAt)) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0);
      avgResolutionDays = Math.round(totalDays / resolvedComplaints.length);
    }

    // By priority
    const byPriority = {};
    complaints.forEach(c => {
      byPriority[c.priority] = (byPriority[c.priority] || 0) + 1;
    });

    res.json({
      department: dept,
      period: `${days} days`,
      total,
      resolved,
      pending,
      rejected,
      resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
      avgResolutionDays,
      byPriority
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
