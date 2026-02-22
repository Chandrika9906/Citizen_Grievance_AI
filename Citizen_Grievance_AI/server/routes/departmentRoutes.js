const express = require("express");
const Department = require("../models/Department");
const Complaint = require("../models/Complaint");
const Officer = require("../models/Officer");

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
   GET ALL DEPARTMENTS
====================================================== */
router.get("/", async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true })
      .sort({ name: 1 });
    
    // Add complaint counts
    const departmentsWithCounts = await Promise.all(
      departments.map(async (dept) => {
        const activeComplaints = await Complaint.countDocuments({
          department: dept.name,
          status: { $nin: ['RESOLVED', 'REJECTED'] }
        });
        
        return {
          ...dept.toObject(),
          activeComplaints
        };
      })
    );
    
    res.json(departmentsWithCounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   GET DEPARTMENT BY ID
====================================================== */
router.get("/:id", async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    
    res.json(department);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   CREATE DEPARTMENT (Admin only)
====================================================== */
router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, description, headName, headEmail, phone } = req.body;
    
    const existingDept = await Department.findOne({ name });
    if (existingDept) {
      return res.status(400).json({ message: "Department already exists" });
    }
    
    const department = new Department({
      name,
      description,
      headName,
      headEmail,
      phone
    });
    
    await department.save();
    
    res.status(201).json({
      message: "Department created successfully",
      department
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   UPDATE DEPARTMENT (Admin only)
====================================================== */
router.put("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, description, headName, headEmail, phone, isActive } = req.body;
    
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { name, description, headName, headEmail, phone, isActive },
      { new: true, runValidators: true }
    );
    
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    
    res.json({
      message: "Department updated successfully",
      department
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   DELETE DEPARTMENT (Admin only)
====================================================== */
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    
    res.json({ message: "Department deactivated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   GET DEPARTMENT STATISTICS
====================================================== */
router.get("/:id/stats", async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    
    // Get complaint stats
    const totalComplaints = await Complaint.countDocuments({ department: department.name });
    const resolvedComplaints = await Complaint.countDocuments({ 
      department: department.name, 
      status: 'RESOLVED' 
    });
    const pendingComplaints = await Complaint.countDocuments({ 
      department: department.name, 
      status: { $in: ['WAITING', 'ASSIGNED', 'IN_PROGRESS'] } 
    });
    
    // Get officer stats
    const officerCount = await Officer.countDocuments({ department: department.name });
    const freeOfficers = await Officer.countDocuments({ 
      department: department.name, 
      status: 'FREE' 
    });
    
    // Calculate resolution rate
    const resolutionRate = totalComplaints > 0 
      ? Math.round((resolvedComplaints / totalComplaints) * 100) 
      : 0;
    
    res.json({
      department: department.name,
      complaints: {
        total: totalComplaints,
        resolved: resolvedComplaints,
        pending: pendingComplaints,
        resolutionRate
      },
      officers: {
        total: officerCount,
        free: freeOfficers,
        busy: officerCount - freeOfficers
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
