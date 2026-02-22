const mongoose = require("mongoose");
const Complaint = require("./models/Complaint");
const Officer = require("./models/Officer");
require("dotenv").config();

async function debugAssign() {
    await mongoose.connect(process.env.MONGO_URI);

    const complaint = await Complaint.findOne({ status: "WAITING" });
    if (!complaint) {
        console.log("No WAITING complaints found.");
        process.exit(0);
    }

    console.log(`Debug assigning complaint ${complaint._id} (Dept: ${complaint.department})`);

    const dept = complaint.department;
    const searchPattern = new RegExp(`^${dept.replace(/s$/, '')}`, 'i');
    console.log(`Pattern: ${searchPattern}`);

    const officers = await Officer.find({
        department: { $regex: searchPattern },
        verified: true
    });

    console.log(`Found ${officers.length} verified officers in matching department.`);
    officers.forEach(o => {
        console.log(`- ${o.name}: status=${o.status}, dept=${o.department}`);
    });

    const matchingOfficer = officers.find(o => o.status === "FREE");
    if (matchingOfficer) {
        console.log(`✅ Match found: ${matchingOfficer.name}`);
    } else {
        console.log("❌ No FREE matches found among verified officers.");
    }

    process.exit(0);
}

debugAssign();
