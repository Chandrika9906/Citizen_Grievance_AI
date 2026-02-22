const mongoose = require("mongoose");
const Complaint = require("./models/Complaint");
const Officer = require("./models/Officer");
const User = require("./models/User");
require("dotenv").config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const cCount = await Complaint.countDocuments();
    const oCount = await Officer.countDocuments();
    const uCount = await User.countDocuments();

    console.log("Database Stats:");
    console.log("Complaints:", cCount);
    console.log("Officers:", oCount);
    console.log("Users:", uCount);

    if (cCount > 0) {
        const latest = await Complaint.find().sort({ createdAt: -1 }).limit(5);
        console.log("\nLatest 5 Complaints:");
        latest.forEach(c => console.log(`- [${c.status}] ${c.department} (P${c.priority}): ${c.description.substring(0, 50)}...`));
    }

    process.exit(0);
}

check();
