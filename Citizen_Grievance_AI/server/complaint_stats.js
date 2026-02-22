const mongoose = require("mongoose");
const Complaint = require("./models/Complaint");
require("dotenv").config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const counts = await Complaint.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    console.log("COMPLAINT STATUS COUNTS:");
    console.log(counts);
    process.exit(0);
}

check();
