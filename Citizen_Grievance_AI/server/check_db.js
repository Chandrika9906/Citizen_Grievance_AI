const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function checkDB() {
    try {
        console.log("Using URI:", process.env.MONGO_URI ? "Found" : "NOT FOUND");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB ✅");

        // Check collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("Collections:", collections.map(c => c.name));

        // Check complaints
        const Complaint = mongoose.model('Complaint', new mongoose.Schema({}), 'complaints');
        const count = await Complaint.countDocuments();
        console.log("Total Complaints in DB:", count);

        if (count > 0) {
            const lastOne = await Complaint.findOne().sort({ _id: -1 });
            console.log("Last Complaint ID:", lastOne._id);
            console.log("Last Complaint Text:", lastOne.description?.substring(0, 50));
        }

        // Check users
        const User = mongoose.model('User', new mongoose.Schema({}), 'users');
        const userCount = await User.countDocuments();
        console.log("Total Users in DB:", userCount);

        process.exit(0);
    } catch (err) {
        console.error("❌ DB Check Failed:", err);
        process.exit(1);
    }
}

checkDB();
