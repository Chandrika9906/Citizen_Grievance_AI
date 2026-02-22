const mongoose = require("mongoose");
require("dotenv").config();
const Complaint = require("./models/Complaint");

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const count = await Complaint.countDocuments();
    const prioritized = await Complaint.aggregate([
        { $group: { _id: "$priority", count: { $sum: 1 } } }
    ]);
    const locations = await Complaint.aggregate([
        { $group: { _id: "$location", count: { $sum: 1 } } }
    ]);

    console.log(`Total complaints: ${count}`);
    console.log("Priority distribution:", prioritized);
    console.log("Location distribution:", locations);
    process.exit(0);
}
check();
