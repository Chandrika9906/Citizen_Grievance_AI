const express = require("express");
const router = express.Router();
const Complaint = require("../models/Complaint");
const Officer = require("../models/Officer");

/**
 * GET /api/dashboard/officer/:officerId
 * Returns all stats needed for the Officer Dashboard in ONE request
 */
router.get("/officer/:officerId", async (req, res) => {
    try {
        const { officerId } = req.params;

        // 1. My Tasks (active)
        const myActiveTasks = await Complaint.countDocuments({
            officerId,
            status: { $in: ["ASSIGNED", "IN_PROGRESS", "ONGOING", "ALMOST_DONE"] }
        });

        // 2. My Resolved Tasks
        const myResolvedTasks = await Complaint.countDocuments({
            officerId,
            status: "RESOLVED"
        });

        // 3. Officer info (to get department)
        const officer = await Officer.findById(officerId).select("-password");
        if (!officer) return res.status(404).json({ message: "Officer not found" });

        // 4. Critical Issues (P4/P5) - all unresolved
        const criticalCount = await Complaint.countDocuments({
            priority: { $gte: 4 },
            status: { $nin: ["RESOLVED", "REJECTED"] }
        });

        // 5. My Dept Critical
        const deptCriticalCount = await Complaint.countDocuments({
            priority: { $gte: 4 },
            department: officer.department,
            status: { $nin: ["RESOLVED", "REJECTED"] }
        });

        // 6. Peer Load (busy officers in same dept)
        const peerLoad = await Officer.countDocuments({
            department: officer.department,
            status: "BUSY"
        });

        // 7. Waiting complaints (for assignment)
        const waitingCount = await Complaint.countDocuments({ status: "WAITING" });

        // 8. Resolution rate (officer)
        const totalHandled = myActiveTasks + myResolvedTasks;
        const resolutionRate = totalHandled > 0
            ? Math.round((myResolvedTasks / totalHandled) * 100)
            : 0;

        // 9. Avg resolution time (officer)
        const resolvedComplaints = await Complaint.find({
            officerId,
            status: "RESOLVED",
            resolvedDate: { $exists: true },
            assignedDate: { $exists: true }
        }).select("assignedDate resolvedDate");

        let avgResolutionHours = 0;
        if (resolvedComplaints.length > 0) {
            const totalMs = resolvedComplaints.reduce((sum, c) => {
                return sum + (new Date(c.resolvedDate) - new Date(c.assignedDate));
            }, 0);
            avgResolutionHours = Math.round((totalMs / resolvedComplaints.length) / (1000 * 60 * 60) * 10) / 10;
        }

        res.json({
            officer: {
                id: officer._id,
                name: officer.name,
                department: officer.department,
                status: officer.status,
                badge: officer.badge
            },
            stats: {
                myActiveTasks,
                myResolvedTasks,
                criticalCount,
                deptCriticalCount,
                peerLoad,
                waitingCount,
                resolutionRate,
                avgResolutionHours
            }
        });
    } catch (err) {
        console.error("[Dashboard] Error:", err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/dashboard/admin
 * System-wide stats for admin view
 */
router.get("/admin", async (req, res) => {
    try {
        const [total, waiting, assigned, inProgress, resolved, rejected, critical] = await Promise.all([
            Complaint.countDocuments(),
            Complaint.countDocuments({ status: "WAITING" }),
            Complaint.countDocuments({ status: "ASSIGNED" }),
            Complaint.countDocuments({ status: { $in: ["IN_PROGRESS", "ONGOING", "ALMOST_DONE"] } }),
            Complaint.countDocuments({ status: "RESOLVED" }),
            Complaint.countDocuments({ status: "REJECTED" }),
            Complaint.countDocuments({ priority: { $gte: 4 }, status: { $nin: ["RESOLVED", "REJECTED"] } })
        ]);

        const [totalOfficers, freeOfficers, busyOfficers] = await Promise.all([
            Officer.countDocuments(),
            Officer.countDocuments({ status: "FREE" }),
            Officer.countDocuments({ status: "BUSY" })
        ]);

        // By department breakdown
        const byDept = await Complaint.aggregate([
            { $match: { status: { $nin: ["RESOLVED", "REJECTED"] } } },
            { $group: { _id: "$department", count: { $sum: 1 }, critical: { $sum: { $cond: [{ $gte: ["$priority", 4] }, 1, 0] } } } },
            { $sort: { count: -1 } }
        ]);

        res.json({
            complaints: { total, waiting, assigned, inProgress, resolved, rejected, critical },
            officers: { total: totalOfficers, free: freeOfficers, busy: busyOfficers },
            byDepartment: byDept
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
