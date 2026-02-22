const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");
const Officer = require("./models/Officer");
const Complaint = require("./models/Complaint");
const { autoAssignOfficer } = require("./utils/assignmentHelper");

const ADDITIONAL_SAMPLES = [
    // 🔴 CRITICAL (P5)
    { description: "Chemical leak in the industrial area drainage system. Dangerous fumes spreading.", location: "Chennai", lat: 13.0827, lng: 80.2707, dept: "Sanitation", priority: 5 },
    { description: "Main road sinkhole appeared after heavy rain. Bus route blocked.", location: "Coimbatore", lat: 11.0168, lng: 76.9558, dept: "Roads", priority: 5 },
    { description: "Power lines sparking and falling across the main market road.", location: "Madurai", lat: 9.9252, lng: 78.1198, dept: "Electricity", priority: 5 },
    { description: "Hospital ICU oxygen plant reporting pressure drop. Immediate technical support needed.", location: "Trichy", lat: 10.7905, lng: 78.7047, dept: "Health", priority: 5 },

    // 🟠 HIGH (P4)
    { description: "Traffic lights at 4-way junction non-functional. Continuous accidents occuring.", location: "Salem", lat: 11.6643, lng: 78.1460, dept: "Roads", priority: 4 },
    { description: "Primary school roof leakage during classes. Water entering electrical boards.", location: "Vellore", lat: 12.9165, lng: 79.1325, dept: "General", priority: 4 },
    { description: "Sewerage overflow into residential apartments. Health hazard.", location: "Erode", lat: 11.3410, lng: 77.7172, dept: "Sanitation", priority: 4 },
    { description: "Drinking water pipe burst near reservoir. Half city without water.", location: "Tirunelveli", lat: 8.7139, lng: 77.7567, dept: "Water", priority: 4 },

    // 🟡 NORMAL / MEDIUM (P3)
    { description: "Street dog pack attacking grocery delivery persons near park.", location: "Chennai", lat: 13.0475, lng: 80.2090, dept: "Health", priority: 3 },
    { description: "Garbage collection truck hasn't visited for 5 days. Foul smell.", location: "Coimbatore", lat: 11.0200, lng: 76.9600, dept: "Sanitation", priority: 3 },
    { description: "Street lights not working near the women's hostel area.", location: "Madurai", lat: 9.9312, lng: 78.1215, dept: "Electricity", priority: 3 },
    { description: "Unauthorised construction blocking the fire exit lane.", location: "Trichy", lat: 10.8000, lng: 78.7100, dept: "General", priority: 3 },
    { description: "Persistent low voltage causing damage to home appliances.", location: "Salem", lat: 11.6700, lng: 78.1500, dept: "Electricity", priority: 3 },

    // 🟢 LOW (P1-2)
    { description: "Public park benches are broken and need painting.", location: "Vellore", lat: 12.9200, lng: 79.1400, dept: "General", priority: 1 },
    { description: "Request for more dustbins near the beach area.", location: "Chennai", lat: 13.0600, lng: 80.2500, dept: "Sanitation", priority: 1 },
    { description: "Small leak in a public tap in the market area.", location: "Tirunelveli", lat: 8.7200, lng: 77.7600, dept: "Water", priority: 2 },
    { description: "Tree branches need trimming near the overhead wires.", location: "Erode", lat: 11.3500, lng: 77.7200, dept: "Electricity", priority: 2 },
    { description: "Pothole repair requested for the internal colony road.", location: "Coimbatore", lat: 11.0300, lng: 76.9700, dept: "Roads", priority: 2 },
    { description: "Noise pollution from the late-night construction site.", location: "Madurai", lat: 9.9400, lng: 78.1300, dept: "General", priority: 2 },
    { description: "Suggestion to improve the drainage slope near 5th cross street.", location: "Trichy", lat: 10.8100, lng: 78.7200, dept: "Sanitation", priority: 1 }
];

async function seedBulkData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB ✅");

        const citizen = await User.findOne({ email: "citizen@test.com" });
        if (!citizen) {
            console.log("❌ Test accounts not found. Run seedDatabase.js first.");
            process.exit(1);
        }

        console.log("Seeding 20 new samples... 📥");

        for (const data of ADDITIONAL_SAMPLES) {
            const complaint = new Complaint({
                userId: citizen._id,
                description: data.description,
                location: data.location,
                latitude: data.lat,
                longitude: data.lng,
                department: data.dept,
                priority: data.priority,
                status: "WAITING",
                aiAnalysis: {
                    sentiment: data.priority >= 4 ? "Negative" : "Neutral",
                    isHotspot: data.priority === 5,
                    isDuplicate: false
                }
            });

            const saved = await complaint.save();
            console.log(`Saved: [P${data.priority}] ${data.description.substring(0, 40)}...`);

            // Try auto-assignment
            await autoAssignOfficer(saved._id, saved.department);
        }

        console.log("\n✅ 20 samples added successfully and filtered across dashboards!");
        process.exit(0);
    } catch (error) {
        console.error("Seeding error:", error);
        process.exit(1);
    }
}

seedBulkData();
