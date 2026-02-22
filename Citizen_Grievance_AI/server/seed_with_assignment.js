const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");
const Officer = require("./models/Officer");
const Complaint = require("./models/Complaint");
const { autoAssignOfficer } = require("./utils/assignmentHelper");

const NEW_SEED_DATA = [
    {
        description: "⚠️ EMERGENCY: LIVE TRANSFORMER WIRE FALLEN! Sparks flying near the crowded market entrance. High risk of electrocution.",
        location: "Chennai",
        latitude: 13.0827,
        longitude: 80.2707,
        department: "Electricity",
        priority: 5,
        status: "WAITING"
    },
    {
        description: "🚨 CRITICAL: HOSPITAL MAIN WATER LINE BURST! Operation theaters losing water supply. Immediate repair required.",
        location: "Coimbatore",
        latitude: 11.0168,
        longitude: 76.9558,
        department: "Water",
        priority: 5,
        status: "WAITING"
    },
    {
        description: "Normal: Street lighting in the north sector is dim and needs maintenance.",
        location: "Madurai",
        latitude: 9.9252,
        longitude: 78.1198,
        department: "Electricity",
        priority: 2,
        status: "WAITING"
    },
    {
        description: "Normal: Small pothole formed near the residential park entrance.",
        location: "Salem",
        latitude: 11.6643,
        longitude: 78.1460,
        department: "Roads",
        priority: 1,
        status: "WAITING"
    },
    {
        description: "Routine: Waste collection bin at the street corner is 80% full.",
        location: "Trichy",
        latitude: 10.7905,
        longitude: 78.7047,
        department: "Sanitation",
        priority: 1,
        status: "WAITING"
    }
];

async function seedAndAssign() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB ✅");

        const citizen = await User.findOne({ email: "citizen@test.com" });
        if (!citizen) {
            console.log("❌ Test citizen not found. Run seedDatabase.js first.");
            process.exit(1);
        }

        console.log("Starting assignment process... 🚀");

        for (const data of NEW_SEED_DATA) {
            const complaint = new Complaint({
                ...data,
                userId: citizen._id,
                aiAnalysis: {
                    sentiment: data.priority >= 4 ? "Negative" : "Neutral",
                    isHotspot: data.priority === 5,
                    isDuplicate: false
                }
            });

            const saved = await complaint.save();
            console.log(`📝 Saved: ${saved.description.substring(0, 30)}...`);

            // Immediately attempt assignment
            const assignedOfficer = await autoAssignOfficer(saved._id, saved.department);

            if (assignedOfficer) {
                console.log(`✅ Assigned to: ${assignedOfficer.name} (Officer is now BUSY)`);
            } else {
                console.log(`⏳ No free officer in ${saved.department}. Status: WAITING`);
            }
        }

        console.log("\nSeeding & Assignment complete! Check Dashboard.");
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

seedAndAssign();
