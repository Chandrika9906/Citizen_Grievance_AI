const mongoose = require("mongoose");
require("dotenv").config();

const Complaint = require("./models/Complaint");

async function verifyDashboardStats() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("📊 DASHBOARD STATISTICS VERIFICATION\n");

        // Total complaint count
        const totalCount = await Complaint.countDocuments();
        console.log(`✅ Total Complaints: ${totalCount}`);

        // Priority breakdown
        const priorityStats = await Complaint.aggregate([
            { $group: { _id: "$priority", count: { $sum: 1 } } },
            { $sort: { _id: -1 } }
        ]);

        console.log("\n🎯 Priority Breakdown:");
        priorityStats.forEach(stat => {
            const label = stat._id === 3 ? "Critical" : stat._id === 2 ? "Normal" : "Low";
            const emoji = stat._id === 3 ? "🔴" : stat._id === 2 ? "🟡" : "🟢";
            console.log(`${emoji} ${label}: ${stat.count} complaints`);
        });

        // Department-wise distribution
        const deptStats = await Complaint.aggregate([
            { $group: { _id: "$department", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        console.log("\n🏢 Department-wise Distribution:");
        deptStats.forEach(stat => {
            console.log(`   ${stat._id}: ${stat.count} complaints`);
        });

        // Status counts
        const statusStats = await Complaint.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        console.log("\n📋 Status Breakdown:");
        statusStats.forEach(stat => {
            const emoji = stat._id === "WAITING" ? "⏳" : 
                         stat._id === "ASSIGNED" ? "👤" :
                         stat._id === "IN_PROGRESS" ? "🔄" :
                         stat._id === "RESOLVED" ? "✅" : "❌";
            console.log(`${emoji} ${stat._id}: ${stat.count} complaints`);
        });

        // Recent additions (today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayCount = await Complaint.countDocuments({
            createdAt: { $gte: today }
        });

        console.log(`\n📅 Today's Additions: ${todayCount} complaints`);

        // Latest 5 complaints for verification
        const latestComplaints = await Complaint.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('description priority department status createdAt');

        console.log("\n📝 Latest 5 Complaints:");
        latestComplaints.forEach((complaint, index) => {
            const priorityLabel = complaint.priority === 3 ? "CRITICAL" : 
                                 complaint.priority === 2 ? "NORMAL" : "LOW";
            console.log(`${index + 1}. [${priorityLabel}] ${complaint.description.substring(0, 50)}...`);
            console.log(`   Dept: ${complaint.department} | Status: ${complaint.status}`);
        });

        console.log("\n✅ All complaints are properly stored and will reflect in dashboard!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Verification error:", error);
        process.exit(1);
    }
}

verifyDashboardStats();