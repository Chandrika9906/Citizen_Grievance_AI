const express = require("express");
const User = require("../models/User");
const Complaint = require("../models/Complaint");
const Settings = require("../models/Settings");
const Notification = require("../models/Notification");
const bcrypt = require("bcryptjs");

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
   GET ALL USERS (Admin only)
====================================================== */
router.get("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   GET USER BY ID
====================================================== */
router.get("/:id", verifyToken, async (req, res) => {
  try {
    // Users can only view their own profile unless admin
    if (req.userId !== req.params.id && req.userRole !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findById(req.params.id).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   UPDATE USER PROFILE
====================================================== */
router.put("/:id", verifyToken, async (req, res) => {
  try {
    // Users can only update their own profile unless admin
    if (req.userId !== req.params.id && req.userRole !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }

    const allowedUpdates = ['name', 'phone', 'address', 'city', 'state', 'pincode'];
    const updates = {};
    
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   DELETE USER ACCOUNT
====================================================== */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    // Users can only delete their own account unless admin
    if (req.userId !== req.params.id && req.userRole !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete related data
    await Settings.deleteOne({ userId: req.params.id });
    await Notification.deleteMany({ userId: req.params.id });
    // Note: Complaints are kept for records but anonymized

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   EXPORT USER DATA
====================================================== */
router.post("/export-data", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    // Get user data
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user settings
    const settings = await Settings.findOne({ userId });

    // Get user complaints
    const complaints = await Complaint.find({ userId })
      .select("-userId")
      .sort({ createdAt: -1 });

    // Get user notifications
    const notifications = await Notification.find({ userId })
      .select("-userId")
      .sort({ createdAt: -1 })
      .limit(100);

    // Create export data
    const exportData = {
      exportedAt: new Date().toISOString(),
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      settings: settings || {},
      complaints: {
        total: complaints.length,
        items: complaints
      },
      notifications: {
        total: notifications.length,
        items: notifications
      }
    };

    res.json({
      message: "Data export ready",
      data: exportData
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   GET CITIZEN STATS (for citizen dashboard)
====================================================== */
router.get("/stats/citizen", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    const totalComplaints = await Complaint.countDocuments({ userId });
    const resolved = await Complaint.countDocuments({ userId, status: 'RESOLVED' });
    const pending = await Complaint.countDocuments({ 
      userId, 
      status: { $in: ['WAITING', 'ASSIGNED', 'IN_PROGRESS'] } 
    });
    const rejected = await Complaint.countDocuments({ userId, status: 'REJECTED' });

    const unreadNotifications = await Notification.countDocuments({ 
      userId, 
      read: false 
    });

    res.json({
      complaints: {
        total: totalComplaints,
        resolved,
        pending,
        rejected,
        resolutionRate: totalComplaints > 0 ? Math.round((resolved / totalComplaints) * 100) : 0
      },
      notifications: {
        unread: unreadNotifications
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
