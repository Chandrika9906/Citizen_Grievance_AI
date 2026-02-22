const mongoose = require("mongoose");
require("dotenv").config();
const Complaint = require("./models/Complaint");
const Officer = require("./models/Officer");

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const stats = await Complaint.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
    const critical = await Complaint.countDocuments({ priority: { $gte: 4 }, status: { $nin: ["RESOLVED", "REJECTED"] } });
    const officers = await Officer.find({}, "name department status");
    console.log("COMPLAINTS BY STATUS:", JSON.stringify(stats, null, 2));
    console.log("CRITICAL UNRESOLVED:", critical);
    console.log("OFFICERS:", officers.map(o => `${o.name} (${o.department}): ${o.status}`).join("\n  "));
    process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
