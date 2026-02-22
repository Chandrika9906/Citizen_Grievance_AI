const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/User");
const Complaint = require("./models/Complaint");

async function check() {
    await mongoose.connect(process.env.MONGO_URI);

    // 1. Get the test user
    const user = await User.findOne({ email: "citizen@test.com" });
    if (!user) {
        console.log("❌ citizen@test.com NOT FOUND in database!");
    } else {
        console.log(`✅ User Found: ${user.name} (${user.email})`);
        console.log(`🆔 User ID: ${user._id}`);
    }

    // 2. Count complaints for this specific user
    const userComplaints = await Complaint.countDocuments({ userId: user._id });
    console.log(`📊 Complaints assigned to this user: ${userComplaints}`);

    // 3. Count total complaints
    const total = await Complaint.countDocuments();
    console.log(`🌍 Total complaints in DB: ${total}`);

    // 4. List a few IDs to check format
    const samples = await Complaint.find({ userId: user._id }).limit(3);
    console.log("Sample User IDs in Complaints:");
    samples.forEach(s => console.log(`- Complaint ID: ${s._id}, UserID in record: ${s.userId}`));

    process.exit(0);
}
check();
