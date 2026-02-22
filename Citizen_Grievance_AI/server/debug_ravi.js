const mongoose = require("mongoose");
const Officer = require("./models/Officer");
const Complaint = require("./models/Complaint");
require("dotenv").config();

async function debugRavi() {
    await mongoose.connect(process.env.MONGO_URI);

    const ravi = await Officer.findOne({ name: /Ravi/i });
    if (!ravi) {
        console.log("Ravi not found.");
        process.exit(0);
    }

    console.log(`OFFICER: ${ravi.name} (_id: ${ravi._id}, status: ${ravi.status})`);

    const linkedComplaints = await Complaint.find({ officerId: ravi._id });
    console.log(`FOUND ${linkedComplaints.length} complaints linked to Ravi.`);

    linkedComplaints.forEach(c => {
        console.log(`- Complaint ${c._id}: Status=${c.status}, Desc=${c.description.substring(0, 30)}`);
    });

    process.exit(0);
}

debugRavi();
