const express = require("express");
const Officer = require("../models/Officer");
const bcrypt = require("bcryptjs");

const router = express.Router();

// Get all officers
router.get("/", async (req, res) => {
  try {
    const officers = await Officer.find().select("-password");
    res.json(officers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get officer by ID
router.get("/:id", async (req, res) => {
  try {
    const officer = await Officer.findById(req.params.id).select("-password");
    
    if (!officer) {
      return res.status(404).json({ message: "Officer not found" });
    }
    
    res.json(officer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get available officers by department
router.get("/available/:department", async (req, res) => {
  try {
    const officers = await Officer.find({
      department: req.params.department,
      status: "FREE",
      verified: true
    }).select("-password");
    
    res.json(officers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update officer status
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    
    const officer = await Officer.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select("-password");
    
    if (!officer) {
      return res.status(404).json({ message: "Officer not found" });
    }
    
    res.json({
      message: "Officer status updated",
      officer
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create officer (admin only)
router.post("/create", async (req, res) => {
  try {
    const { name, email, password, department, badge, phone } = req.body;
    
    const existingOfficer = await Officer.findOne({ email });
    if (existingOfficer) {
      return res.status(400).json({ message: "Officer already exists" });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newOfficer = new Officer({
      name,
      email,
      password: hashedPassword,
      department,
      badge,
      phone,
      status: "FREE",
      verified: true,
      role: "officer"
    });
    
    await newOfficer.save();
    
    res.json({ message: "Officer created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get officer statistics
router.get("/stats/summary", async (req, res) => {
  try {
    const total = await Officer.countDocuments();
    const free = await Officer.countDocuments({ status: "FREE" });
    const busy = await Officer.countDocuments({ status: "BUSY" });
    
    const byDepartment = await Officer.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } }
    ]);
    
    res.json({
      total,
      free,
      busy,
      byDepartment
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   UPDATE OFFICER
====================================================== */
router.put("/:id", async (req, res) => {
  try {
    const { name, department, phone, badge } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (department) updateData.department = department;
    if (phone) updateData.phone = phone;
    if (badge) updateData.badge = badge;

    const officer = await Officer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");
    
    if (!officer) {
      return res.status(404).json({ message: "Officer not found" });
    }
    
    res.json({
      message: "Officer updated successfully",
      officer
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   DELETE OFFICER
====================================================== */
router.delete("/:id", async (req, res) => {
  try {
    const officer = await Officer.findByIdAndDelete(req.params.id);
    
    if (!officer) {
      return res.status(404).json({ message: "Officer not found" });
    }
    
    res.json({ message: "Officer deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   GET OFFICER WORKLOAD
====================================================== */
router.get("/:id/workload", async (req, res) => {
  try {
    const Complaint = require("../models/Complaint");
    
    const officer = await Officer.findById(req.params.id).select("-password");
    if (!officer) {
      return res.status(404).json({ message: "Officer not found" });
    }
    
    const activeComplaints = await Complaint.find({
      officerId: req.params.id,
      status: { $in: ['ASSIGNED', 'IN_PROGRESS'] }
    }).populate("userId", "name email");
    
    const completedComplaints = await Complaint.countDocuments({
      officerId: req.params.id,
      status: 'RESOLVED'
    });
    
    res.json({
      officer: {
        id: officer._id,
        name: officer.name,
        department: officer.department,
        status: officer.status
      },
      activeComplaints: activeComplaints.length,
      completedComplaints,
      activeList: activeComplaints
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   GET OFFICER HISTORY
====================================================== */
router.get("/:id/history", async (req, res) => {
  try {
    const Complaint = require("../models/Complaint");
    
    const { page = 1, limit = 20 } = req.query;
    
    const complaints = await Complaint.find({
      officerId: req.params.id,
      status: 'RESOLVED'
    })
      .populate("userId", "name email")
      .sort({ resolvedDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Complaint.countDocuments({
      officerId: req.params.id,
      status: 'RESOLVED'
    });
    
    res.json({
      complaints,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   VERIFY OFFICER
====================================================== */
router.put("/:id/verify", async (req, res) => {
  try {
    const { verified } = req.body;
    
    const officer = await Officer.findByIdAndUpdate(
      req.params.id,
      { verified },
      { new: true }
    ).select("-password");
    
    if (!officer) {
      return res.status(404).json({ message: "Officer not found" });
    }
    
    res.json({
      message: `Officer ${verified ? 'verified' : 'unverified'} successfully`,
      officer
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   GET OFFICERS BY DEPARTMENT
====================================================== */
router.get("/department/:department", async (req, res) => {
  try {
    const officers = await Officer.find({ 
      department: req.params.department 
    }).select("-password");
    
    res.json(officers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
