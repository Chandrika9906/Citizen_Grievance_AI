const mongoose = require("mongoose");
const Complaint = require("./models/Complaint");
const Officer = require("./models/Officer");
require("dotenv").config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI);

    const waitingByDept = await Complaint.aggregate([
        { $match: { status: "WAITING" } },
        { $group: { _id: "$department", count: { $sum: 1 } } }
    ]);

    const freeByDept = await Officer.aggregate([
        { $match: { status: "FREE", verified: true } },
        { $group: { _id: "$department", count: { $sum: 1 } } }
    ]);

    console.log("WAITING Complaints by Dept:");
    console.log(JSON.stringify(waitingByDept, null, 2));

    console.log("\nFREE Officers by Dept:");
    console.log(JSON.stringify(freeByDept, null, 2));

    process.exit(0);
}

check();
