const mongoose = require("mongoose");
require("dotenv").config();
const Officer = require("./models/Officer");
const Complaint = require("./models/Complaint");
const { autoAssignOfficer } = require("./utils/assignmentHelper");

async function freeTestOfficer() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const email = "officer@test.com"; // Default test officer
        let officer = await Officer.findOne({ email });

        if (!officer) {
            console.log("Officer not found!");
            // Create one if missing for some reason
            officer = new Officer({
                name: "Test Officer",
                email: email,
                department: "Roads",
                password: "password123",
                role: "officer",
                status: "FREE",
                verified: true
            });
            await officer.save();
            console.log("Created test officer.");
        } else {
            await Officer.findByIdAndUpdate(officer._id, { status: "FREE" });
            console.log(`Officer ${email} is now FREE.`);
        }

        // Assign something
        const complaint = await Complaint.findOne({
            department: "Roads",
            status: "WAITING"
        }).sort({ priority: -1 });

        if (complaint) {
            console.log(`Assigning ${complaint._id} to ${email}...`);
            await autoAssignOfficer(complaint._id, "Roads");
        } else {
            console.log("No waiting Roads complaints.");
        }

        process.exit(0);
    } catch (e) { console.error(e); process.exit(1); }
}

freeTestOfficer();
