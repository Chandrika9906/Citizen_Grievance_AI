const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");
const Officer = require("./models/Officer");
const Complaint = require("./models/Complaint");

async function debugAssignments() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // 1. Check Officers
        const officers = await Officer.find({});
        console.log(`\n👮 FOUND ${officers.length} OFFICERS:`);
        officers.forEach(o => {
            console.log(`- ${o.name} (${o.department}) [${o.status}] verified:${o.verified}`);
        });

        // 2. Check Waiting Complaints
        const waiting = await Complaint.countDocuments({ status: "WAITING" });
        console.log(`\n⏳ ${waiting} WAITING COMPLAINTS.`);

        // 3. Check Assigned Complaints
        const assigned = await Complaint.find({ status: { $in: ["ASSIGNED", "IN_PROGRESS"] } }).populate("officerId");
        console.log(`\n✅ ${assigned.length} ACTIVE ASSIGNMENTS:`);
        assigned.forEach(c => {
            const offName = c.officerId ? c.officerId.name : "UNKNOWN_OFFICER";
            console.log(`- Complaint ${c._id} -> ${offName} (${c.department})`);
        });

        // 4. Try to find match for a waiting complaint
        const sampleWaiting = await Complaint.findOne({ status: "WAITING" });
        if (sampleWaiting) {
            console.log(`\n🕵️ DEBUGGING ONE WAITING CASE: ${sampleWaiting._id} (${sampleWaiting.department})`);
            const searchPattern = new RegExp(`^${sampleWaiting.department.replace(/s$/, '')}`, 'i');
            console.log(`   Regex: ${searchPattern}`);

            const candidates = await Officer.find({
                department: { $regex: searchPattern },
                verified: true
            });
            console.log(`   Found ${candidates.length} candidate officers in DB.`);
            candidates.forEach(c => console.log(`   - ${c.name}: ${c.status}`));

            const free = candidates.filter(c => c.status === "FREE");
            console.log(`   ${free.length} are FREE.`);
        }

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

debugAssignments();
