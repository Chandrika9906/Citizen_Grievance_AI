const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");
const Officer = require("./models/Officer");
const Complaint = require("./models/Complaint");

const TRIAL_DATA = [
    // 🔴 CRITICAL (Priority 5)
    {
        description: "MAJOR GAS LEAK DETECTED: Residents reporting strong smell near industrial estate. Immediate evacuation might be needed.",
        location: "Chennai",
        latitude: 13.0827,
        longitude: 80.2707,
        department: "Health",
        priority: 5,
        status: "WAITING"
    },
    {
        description: "BRIDGE COLLAPSE RISK: Significant cracks visible on the main flyover after heavy rains. Traffic needs to be diverted immediately!",
        location: "Coimbatore",
        latitude: 11.0168,
        longitude: 76.9558,
        department: "Roads",
        priority: 5,
        status: "ASSIGNED"
    },
    {
        description: "HOSPITAL POWER FAILURE: Backup generators failing at Govt Hospital. Lives at risk in ICU.",
        location: "Madurai",
        latitude: 9.9252,
        longitude: 78.1198,
        department: "Electricity",
        priority: 5,
        status: "IN_PROGRESS"
    },

    // 🟠 HIGH (Priority 4)
    {
        description: "TOTAL BLACKOUT: Entire residential block without power for 12 hours. Transformers sparking.",
        location: "Trichy",
        latitude: 10.7905,
        longitude: 78.7047,
        department: "Electricity",
        priority: 4,
        status: "WAITING"
    },
    {
        description: "TOXIC WASTE SPILL: Chemical truck overturned near the river bank. Water contamination imminent.",
        location: "Erode",
        latitude: 11.3410,
        longitude: 77.7172,
        department: "Sanitation",
        priority: 4,
        status: "ASSIGNED"
    },
    {
        description: "OPEN MAIN SEWER: A large manhole is left open on the high-speed bypass. Extremely dangerous for two-wheelers.",
        location: "Salem",
        latitude: 11.6643,
        longitude: 78.1460,
        department: "Sanitation",
        priority: 4,
        status: "WAITING"
    },

    // 🟡 MEDIUM (Priority 3)
    {
        description: "Stray Dog Menace: Pack of aggressive dogs near the primary school. Children are scared to enter.",
        location: "Vellore",
        latitude: 12.9165,
        longitude: 79.1325,
        department: "Health",
        priority: 3,
        status: "WAITING"
    },
    {
        description: "Dead Animal in Canal: A large animal carcass is rotting in the drinking water canal. Foul smell.",
        location: "Tirunelveli",
        latitude: 8.7139,
        longitude: 77.7567,
        department: "Water",
        priority: 3,
        status: "ASSIGNED"
    },
    {
        description: "Street Lights Broken: All lights on the 5th Cross Street are dark for a week. Safety concern at night.",
        location: "Chennai",
        latitude: 13.0475,
        longitude: 80.2090,
        department: "Electricity",
        priority: 3,
        status: "RESOLVED"
    },
    {
        description: "Pothole Series: Multiple large potholes formed after the recent monsoon near the bus stop.",
        location: "Madurai",
        latitude: 9.9312,
        longitude: 78.1215,
        department: "Roads",
        priority: 3,
        status: "WAITING"
    },

    // 🟢 LOW (Priority 1-2)
    {
        description: "Garbage Bin Overflow: The community bin hasn't been cleared for 3 days. It's starting to smell.",
        location: "Coimbatore",
        latitude: 11.0200,
        longitude: 76.9600,
        department: "Sanitation",
        priority: 2,
        status: "RESOLVED"
    },
    {
        description: "Unauthorized Poster: Public walls are covered with political posters near the heritage site.",
        location: "Trichy",
        latitude: 10.8000,
        longitude: 78.7100,
        department: "General",
        priority: 1,
        status: "RESOLVED"
    },
    {
        description: "Leaking Tap in Park: The public tap in Anna Park is constantly dripping. Wasting water.",
        location: "Salem",
        latitude: 11.6700,
        longitude: 78.1500,
        department: "Water",
        priority: 1,
        status: "RESOLVED"
    },
    {
        description: "Tree branches touching wires: Need pruning before the wind season starts.",
        location: "Chennai",
        latitude: 13.0600,
        longitude: 80.2500,
        department: "Electricity",
        priority: 2,
        status: "WAITING"
    },
    {
        description: "Illegal Parking: Cars parked on the narrow lane blocking the ambulance path occasionally.",
        location: "Vellore",
        latitude: 12.9200,
        longitude: 79.1400,
        department: "Roads",
        priority: 2,
        status: "IN_PROGRESS"
    },
    {
        description: "Dust Pollution: Construction site not using water spray, entire street covered in dust.",
        location: "Madurai",
        latitude: 9.9400,
        longitude: 78.1300,
        department: "Sanitation",
        priority: 2,
        status: "WAITING"
    },
    {
        description: "Low Water Pressure: Apartment complex getting very slow water supply since Sunday.",
        location: "Coimbatore",
        latitude: 11.0300,
        longitude: 76.9700,
        department: "Water",
        priority: 2,
        status: "WAITING"
    },
    {
        description: "Abandoned Vehicle: A rusted scooter is parked in the corner for 6 months.",
        location: "Trichy",
        latitude: 10.8100,
        longitude: 78.7200,
        department: "General",
        priority: 1,
        status: "WAITING"
    },
    {
        description: "Park Bench Broken: Two benches in the children's play area need welding.",
        location: "Tirunelveli",
        latitude: 8.7200,
        longitude: 77.7600,
        department: "General",
        priority: 1,
        status: "WAITING"
    },
    {
        description: "Clogged Rainwater Drain: Plastic bottles blocking the entrance of the drain.",
        location: "Erode",
        latitude: 11.3500,
        longitude: 77.7200,
        department: "Sanitation",
        priority: 2,
        status: "IN_PROGRESS"
    }
];

async function seedTrialData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB ✅");

        // We no longer clear existing complaints so the earlier analytical data stays
        // await Complaint.deleteMany({});
        console.log("Appending trial data to existing database... 📥");

        const citizen = await User.findOne({ email: "citizen@test.com" });
        const officer = await Officer.findOne({ email: "officer@test.com" });

        if (!citizen || !officer) {
            console.log("❌ Test accounts not found. Run seedDatabase.js first.");
            process.exit(1);
        }

        const complaintsToInsert = TRIAL_DATA.map(data => ({
            ...data,
            userId: citizen._id,
            officerId: (data.status === "ASSIGNED" || data.status === "IN_PROGRESS" || data.status === "RESOLVED") ? officer._id : null,
            assignedDate: (data.status !== "WAITING") ? new Date() : null,
            resolvedDate: (data.status === "RESOLVED") ? new Date() : null,
            resolutionNotes: (data.status === "RESOLVED") ? "The issue has been verified and fixed by the response team." : null,
            aiAnalysis: {
                sentiment: data.priority >= 4 ? "Negative" : "Neutral",
                isHotspot: data.priority >= 5,
                isDuplicate: false
            },
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)), // Random time in last 7 days
            updatedAt: new Date()
        }));

        await Complaint.insertMany(complaintsToInsert);
        console.log(`✅ Successfully seeded ${complaintsToInsert.length} trial complaints.`);

        console.log("\nLegend for Map:");
        console.log("🔴 RED: Critical (Priority 5)");
        console.log("🟠 ORANGE: High (Priority 4)");
        console.log("🟡 YELLOW: Medium (Priority 3)");
        console.log("🟢 GREEN: Low (Priority 1-2)");

        process.exit(0);
    } catch (error) {
        console.error("Seeding error:", error);
        process.exit(1);
    }
}

seedTrialData();
