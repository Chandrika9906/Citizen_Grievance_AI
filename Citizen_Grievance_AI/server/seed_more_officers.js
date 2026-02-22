const mongoose = require("mongoose");
require("dotenv").config();
const Officer = require("./models/Officer");
const Complaint = require("./models/Complaint");
const { autoAssignOfficer } = require("./utils/assignmentHelper");

async function seedOfficers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const newOfficers = [
            { name: "Priya Sharma", email: "priya@gov.in", department: "Roads", location: "Chennai" },
            { name: "Rahul Verma", email: "rahul@gov.in", department: "Electricity", location: "Coimbatore" },
            { name: "Anjali Devi", email: "anjali@gov.in", department: "Sanitation", location: "Madurai" },
            { name: "Vikram Singh", email: "vikram@gov.in", department: "Water", location: "Trichy" },
            { name: "Suresh Kumar", email: "suresh@gov.in", department: "General", location: "Salem" },
            { name: "Deepa Raj", email: "deepa@gov.in", department: "Health", location: "Vellore" },
            { name: "Karthik N", email: "karthik@gov.in", department: "Roads", location: "Erode" },
            { name: "Meera K", email: "meera@gov.in", department: "Sanitation", location: "Tirunelveli" }
        ];

        console.log(`Adding ${newOfficers.length} new officers...`);

        for (const data of newOfficers) {
            // Check duplicate
            const exists = await Officer.findOne({ email: data.email });
            if (!exists) {
                const officer = new Officer({
                    ...data,
                    password: "password123", // Default
                    role: "officer",
                    status: "FREE",
                    verified: true,
                    phone: "9876543210"
                });
                await officer.save();
                console.log(`✅ Added Officer: ${officer.name} (${officer.department})`);
            } else {
                console.log(`⚠️ Officer ${data.name} already exists. Resetting to FREE.`);
                await Officer.findByIdAndUpdate(exists._id, { status: "FREE" });
            }
        }

        // Now trigger assignment for waiting complaints
        console.log("\n🔄 Retrying assignment for WAITING complaints...");
        const waiting = await Complaint.find({ status: "WAITING" }).sort({ priority: -1 });

        for (const complaint of waiting) {
            const assigned = await autoAssignOfficer(complaint._id, complaint.department);
            if (assigned) {
                console.log(`   -> Assigned ${complaint._id} to ${assigned.name}`);
            }
        }

        console.log("\nDONE! Officers added and assignments triggered.");
        process.exit(0);

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

seedOfficers();
