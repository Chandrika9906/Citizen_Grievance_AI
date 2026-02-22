const express = require("express");
const Notification = require("../models/Notification");

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
   GET ALL NOTIFICATIONS FOR USER
====================================================== */
router.get("/", verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   GET UNREAD COUNT
====================================================== */
router.get("/unread-count", verifyToken, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      userId: req.userId, 
      read: false 
    });
    
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   MARK NOTIFICATION AS READ
====================================================== */
router.put("/:id/read", verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   MARK NOTIFICATION AS UNREAD
====================================================== */
router.put("/:id/unread", verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { read: false },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   MARK ALL AS READ
====================================================== */
router.put("/mark-all-read", verifyToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.userId, read: false },
      { read: true }
    );
    
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   DELETE NOTIFICATION
====================================================== */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    res.json({ message: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   CLEAR ALL NOTIFICATIONS
====================================================== */
router.delete("/clear-all", verifyToken, async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.userId });
    
    res.json({ message: "All notifications cleared" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   CREATE NOTIFICATION (Internal use)
====================================================== */
router.post("/create", async (req, res) => {
  try {
    const { userId, type, title, message, complaintId } = req.body;
    
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      complaintId
    });
    
    await notification.save();
    
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
