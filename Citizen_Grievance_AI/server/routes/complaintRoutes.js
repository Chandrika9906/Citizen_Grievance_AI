const express = require("express");
const Complaint = require("../models/Complaint");
const { autoAssignOfficer, freeOfficer } = require("../utils/assignmentHelper");
const { createNotification } = require("../utils/notificationHelper");

const router = express.Router();

// AI Service URL
const AI_SERVICE_URL = "http://localhost:5001";

// Call AI Service for complete analysis
async function analyzeComplaint(description, latitude, longitude, userId) {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/analyze-complaint`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: description,
        latitude,
        longitude,
        userId
      })
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.log("AI service unavailable, using fallback");
  }

  // Fallback to basic logic if AI service fails
  return {
    department: "General",
    priority: 1,
    sentiment: { polarity: "neutral" },
    hotspot: { is_hotspot: false },
    duplicate: { is_duplicate: false }
  };
}

router.post("/create", async (req, res) => {
  try {
    console.log("🔵 [CREATE] Request received");
    console.log("📦 [CREATE] Request body:", JSON.stringify(req.body, null, 2));

    const {
      userId,
      description,
      latitude,
      longitude,
      department,
      priority,
      imageUrl,
      aiAnalysis
    } = req.body;

    let finalDepartment = department;
    let finalPriority = priority;
    let finalAiAnalysis = aiAnalysis;

    if (!department || !priority) {
      const aiResult = await analyzeComplaint(description, latitude, longitude, userId);
      finalDepartment = aiResult.department;
      finalPriority = aiResult.priority;
      finalAiAnalysis = {
        sentiment: aiResult.sentiment?.sentiment || aiResult.sentiment?.polarity,
        isHotspot: aiResult.hotspot?.is_hotspot,
        isDuplicate: aiResult.duplicate?.is_duplicate
      };
    }

    const newComplaint = new Complaint({
      userId,
      description,
      latitude,
      longitude,
      department: finalDepartment,
      priority: finalPriority,
      imageUrl: imageUrl || null,
      aiAnalysis: finalAiAnalysis
    });

    const savedComplaint = await newComplaint.save();

    // NOTIFY CITIZEN: Creation
    await createNotification(
      userId,
      "info",
      "Complaint Submitted",
      `Your complaint regarding ${finalDepartment} has been submitted successfully.`,
      savedComplaint._id
    );

    // Auto-assign to officer
    const assignedOfficer = await autoAssignOfficer(savedComplaint._id, finalDepartment);

    if (assignedOfficer) {
      // NOTIFY OFFICER: New assignment
      await createNotification(
        assignedOfficer._id,
        "warning",
        "New Task Assigned",
        `A new P${finalPriority} complaint has been assigned to you.`,
        savedComplaint._id
      );

      // NOTIFY CITIZEN: Officer assigned
      await createNotification(
        userId,
        "success",
        "Officer Assigned",
        `Officer ${assignedOfficer.name} has been assigned to your complaint.`,
        savedComplaint._id
      );
    }

    const finalComplaint = await Complaint.findById(savedComplaint._id)
      .populate("officerId", "name email department");

    res.json({
      message: "Complaint submitted successfully",
      data: {
        _id: finalComplaint._id,
        department: finalComplaint.department,
        priority: finalComplaint.priority,
        assignedOfficer: finalComplaint.officerId ? finalComplaint.officerId.name : "Pending assignment",
        aiAnalysis: finalComplaint.aiAnalysis,
        imageUrl: finalComplaint.imageUrl,
        status: finalComplaint.status
      }
    });

  } catch (err) {
    console.error("❌ [CREATE] Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get all complaints for a user
router.get("/user/:userId", async (req, res) => {
  try {
    console.log(`🔍 [API] Fetching complaints for User: ${req.params.userId}`);
    const complaints = await Complaint.find({ userId: req.params.userId })
      .populate("officerId", "name email department")
      .sort({ createdAt: -1 });

    console.log(`✅ [API] Found ${complaints.length} records`);
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get all complaints assigned to an officer
router.get("/officer/:officerId", async (req, res) => {
  try {
    const complaints = await Complaint.find({ officerId: req.params.officerId })
      .populate("userId", "name email")
      .sort({ priority: -1, createdAt: -1 });

    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single complaint details
router.get("/:id", async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("userId", "name email")
      .populate("officerId", "name email department");

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json(complaint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update complaint status
router.put("/:id/status", async (req, res) => {
  try {
    const { status, resolutionNotes, rejectionReason } = req.body;

    const updateData = { status };

    if (status === "RESOLVED") {
      updateData.resolvedDate = new Date();
      updateData.resolutionNotes = resolutionNotes;
    } else if (status === "REJECTED") {
      updateData.rejectionReason = rejectionReason;
      updateData.resolvedDate = new Date(); // Effectively closed
    } else if (status === "ONGOING" || status === "ALMOST_DONE") {
      // Progress update - no date change needed
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("userId", "name email").populate("officerId", "name email");

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Free officer if complaint is resolved or rejected (final state)
    if (status === "RESOLVED" || status === "REJECTED") {
      if (complaint.officerId) {
        await freeOfficer(complaint.officerId._id || complaint.officerId);

        // NOTIFY OFFICER: Task completed/closed
        await createNotification(
          complaint.officerId._id || complaint.officerId,
          status === "RESOLVED" ? "success" : "error",
          status === "RESOLVED" ? "Task Completed" : "Task Rejected",
          `Complaint #${complaint._id.toString().slice(-6)} marked as ${status}.`,
          complaint._id
        );
      }

      // NOTIFY CITIZEN
      if (status === "RESOLVED") {
        await createNotification(
          complaint.userId._id || complaint.userId,
          "success",
          "Issue Resolved ✅",
          `Your complaint regarding ${complaint.department} has been resolved: ${resolutionNotes || 'No notes provided.'}`,
          complaint._id
        );
      } else if (status === "REJECTED") {
        await createNotification(
          complaint.userId._id || complaint.userId,
          "error",
          "Issue Rejected",
          `Your complaint was rejected: ${rejectionReason || 'No reason provided.'}`,
          complaint._id
        );
      }
    } else if (status === "ONGOING") {
      // Notify citizen: work has started
      await createNotification(
        complaint.userId._id || complaint.userId,
        "info",
        "Work In Progress 🔧",
        `An officer is actively working on your ${complaint.department} complaint. Stay tuned!`,
        complaint._id
      );
    } else if (status === "ALMOST_DONE") {
      // Notify citizen: almost done
      await createNotification(
        complaint.userId._id || complaint.userId,
        "warning",
        "Almost Resolved ⏳",
        `Your ${complaint.department} complaint is in final stages. Resolution expected very soon!`,
        complaint._id
      );
    }

    res.json({
      message: "Status updated successfully",
      complaint
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get complaint statistics
router.get("/stats/summary", async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const waiting = await Complaint.countDocuments({ status: "WAITING" });
    const assigned = await Complaint.countDocuments({ status: "ASSIGNED" });
    const inProgress = await Complaint.countDocuments({ status: "IN_PROGRESS" });
    const resolved = await Complaint.countDocuments({ status: "RESOLVED" });

    const byDepartment = await Complaint.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } }
    ]);

    const byPriority = await Complaint.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } }
    ]);

    res.json({
      total,
      byStatus: { waiting, assigned, inProgress, resolved },
      byDepartment,
      byPriority
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   GET ALL COMPLAINTS (with filters)
====================================================== */
router.get("/", async (req, res) => {
  try {
    const { status, department, priority, startDate, endDate, page = 1, limit = 1000 } = req.query;

    const query = {};

    if (status) {
      if (status === 'PENDING') {
        query.status = { $in: ['WAITING', 'ASSIGNED'] };
      } else {
        query.status = status;
      }
    }

    if (department) query.department = department;
    if (priority) query.priority = parseInt(priority);

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const complaints = await Complaint.find(query)
      .populate("userId", "name email")
      .populate("officerId", "name email department")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Complaint.countDocuments(query);

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
   👤 GET USER COMPLAINTS (Missing Route Fixed)
====================================================== */
router.get("/user/:id", async (req, res) => {
  try {
    const complaints = await Complaint.find({ userId: req.params.id })
      .populate("officerId", "name email department")
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   👮 GET OFFICER COMPLAINTS (Missing Route Fixed)
====================================================== */
router.get("/officer/:id", async (req, res) => {
  try {
    const complaints = await Complaint.find({ officerId: req.params.id })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   UPDATE COMPLAINT
====================================================== */
router.put("/:id", async (req, res) => {
  try {
    const { description, latitude, longitude, priority } = req.body;

    const updateData = {};
    if (description) updateData.description = description;
    if (latitude) updateData.latitude = latitude;
    if (longitude) updateData.longitude = longitude;
    if (priority) updateData.priority = priority;

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json({
      message: "Complaint updated successfully",
      complaint
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   DELETE COMPLAINT
====================================================== */
router.delete("/:id", async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Free officer if complaint was assigned
    if (complaint.officerId) {
      await freeOfficer(complaint.officerId);
    }

    res.json({ message: "Complaint deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   OFFICER ACCEPTS COMPLAINT
====================================================== */
router.post("/:id/accept", async (req, res) => {
  try {
    const { officerId } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        status: "IN_PROGRESS",
        officerId: officerId,
        assignedDate: new Date()
      },
      { new: true }
    ).populate("userId", "name email");

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Update officer status to BUSY
    const Officer = require("../models/Officer");
    await Officer.findByIdAndUpdate(officerId, { status: "BUSY" });

    res.json({
      message: "Complaint accepted successfully",
      complaint
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   OFFICER REJECTS COMPLAINT
====================================================== */
router.post("/:id/reject", async (req, res) => {
  try {
    const { reason, officerId } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        status: "WAITING",
        officerId: null,
        $push: {
          rejectionHistory: {
            officerId,
            reason,
            date: new Date()
          }
        }
      },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Auto-assign to another officer
    const assignedOfficer = await autoAssignOfficer(complaint._id, complaint.department);

    res.json({
      message: "Complaint rejected, reassigned to another officer",
      complaint,
      reassignedTo: assignedOfficer ? assignedOfficer.name : "Pending assignment"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   ASSIGN COMPLAINT TO OFFICER
====================================================== */
router.post("/:id/assign", async (req, res) => {
  try {
    const { officerId } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        status: "ASSIGNED",
        officerId: officerId,
        assignedDate: new Date()
      },
      { new: true }
    ).populate("userId", "name email");

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Update officer status to BUSY
    const Officer = require("../models/Officer");
    await Officer.findByIdAndUpdate(officerId, { status: "BUSY" });

    res.json({
      message: "Complaint assigned successfully",
      complaint
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   TRIGGER AUTO-ASSIGNMENT SWEEP
====================================================== */
router.post("/auto-assign", async (req, res) => {
  try {
    const waitingComplaints = await Complaint.find({ status: "WAITING" }).sort({ priority: -1 });
    let assignedCount = 0;

    for (const complaint of waitingComplaints) {
      const officer = await autoAssignOfficer(complaint._id, complaint.department);
      if (officer) {
        assignedCount++;

        // Notify Officer
        await createNotification(
          officer._id,
          "warning",
          "Auto-Assigned Task",
          `A pending ${complaint.department} complaint has been auto-assigned to you.`,
          complaint._id
        );

        // Notify Citizen
        await createNotification(
          complaint.userId,
          "success",
          "Officer Assigned",
          `Officer ${officer.name} is now moving to resolve your issue.`,
          complaint._id
        );
      }
    }

    res.json({
      message: `Auto-assignment sweep complete. ${assignedCount} tasks assigned.`,
      assignedCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   GET COMPLAINTS BY STATUS (for filtering)
====================================================== */
router.get("/status/:status", async (req, res) => {
  try {
    const { status } = req.params;

    const complaints = await Complaint.find({ status })
      .populate("userId", "name email")
      .populate("officerId", "name email department")
      .sort({ priority: -1, createdAt: -1 });

    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   UPLOAD IMAGE
====================================================== */
router.post("/upload-image", async (req, res) => {
  try {
    const multer = require('multer');
    const path = require('path');
    const fs = require('fs');

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Configure multer for file upload
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'complaint-' + uniqueSuffix + path.extname(file.originalname));
      }
    });

    const upload = multer({
      storage: storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
      fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
          return cb(null, true);
        } else {
          cb(new Error('Only image files are allowed!'));
        }
      }
    }).single('image');

    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const imageUrl = `/uploads/${req.file.filename}`;
      res.json({
        message: 'Image uploaded successfully',
        imageUrl: imageUrl,
        filename: req.file.filename
      });
    });

  } catch (err) {
    console.error("Image upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
