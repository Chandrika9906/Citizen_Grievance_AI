const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");
const Complaint = require("./models/Complaint");
const Officer = require("./models/Officer");

const RESOLVED_SAMPLES = [
    { desc: "Pothole on 4th Main Road fixed.", loc: "Chennai", dept: "Roads", pri: 2, daysTaken: 2 },
    { desc: "Street light replaced in Sector 5.", loc: "Coimbatore", dept: "Electricity", pri: 3, daysTaken: 1 },
    { desc: "Garbage cleared from market entrance.", loc: "Madurai", dept: "Sanitation", pri: 4, daysTaken: 0.5 },
    { desc: "Water pipe leak repaired.", loc: "Trichy", dept: "Water", pri: 5, daysTaken: 0.2 },
    { desc: "Dead tree removed from park.", loc: "Salem", dept: "General", pri: 1, daysTaken: 4 },
    { desc: "Drainage blockage cleared.", loc: "Vellore", dept: "Sanitation", pri: 3, daysTaken: 1.5 },
    { desc: "Traffic signal synchronized.", loc: "Erode", dept: "Roads", pri: 2, daysTaken: 3 },
    { desc: "Broken bench repaired in bus stand.", loc: "Tirunelveli", dept: "General", pri: 1, daysTaken: 5 },
    { desc: "Transformer fuse replaced.", loc: "Chennai", dept: "Electricity", pri: 4, daysTaken: 0.8 },
    { desc: "Illegal hoarding removed.", loc: "Coimbatore", dept: "General", pri: 2, daysTaken: 2.5 },
    { desc: "Stray cattle relocated.", loc: "Madurai", dept: "General", pri: 2, daysTaken: 1.2 },
    { desc: "Public toilet cleaned and sanitized.", loc: "Trichy", dept: "Sanitation", pri: 3, daysTaken: 1.0 },
    { desc: "Low voltage issue resolved.", loc: "Salem", dept: "Electricity", pri: 3, daysTaken: 2.1 },
    { desc: "Manhole cover replaced.", loc: "Vellore", dept: "Roads", pri: 5, daysTaken: 0.9 },
    { desc: "Park cleanliness drive completed.", loc: "Erode", dept: "Sanitation", pri: 2, daysTaken: 1.8 },
    { desc: "Water contamination check done.", loc: "Tirunelveli", dept: "Water", pri: 4, daysTaken: 2.2 },
    { desc: "Street sign board repainted.", loc: "Chennai", dept: "Roads", pri: 1, daysTaken: 3.5 },
    { desc: "Electric pole aligned.", loc: "Coimbatore", dept: "Electricity", pri: 3, daysTaken: 1.4 },
    { desc: "Mosquito fogging done.", loc: "Madurai", dept: "Health", pri: 4, daysTaken: 0.6 },
    { desc: "Broken footpath tiles verified.", loc: "Trichy", dept: "Roads", pri: 2, daysTaken: 2.8 }
];

const LOCATIONS = {
    'Chennai': [13.0827, 80.2707],
    'Coimbatore': [11.0168, 76.9558],
    'Madurai': [9.9252, 78.1198],
    'Trichy': [10.7905, 78.7047],
    'Salem': [11.6643, 78.1460],
    'Vellore': [12.9165, 79.1325],
    'Erode': [11.3410, 77.7172],
    'Tirunelveli': [8.7139, 77.7567]
};

async function seedResolved() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB ✅");

        const citizen = await User.findOne({ email: "citizen@test.com" });
        const officer = await Officer.findOne(); // Assign to any officer for history

        if (!citizen) {
            console.log("❌ Test citizen not found.");
            process.exit(1);
        }

        console.log("Seeding 20 RESOLVED complaints... 🏁");

        for (const data of RESOLVED_SAMPLES) {
            const createdDate = new Date();
            createdDate.setDate(createdDate.getDate() - (data.daysTaken + 2)); // Created a few days ago

            const resolvedDate = new Date(createdDate);
            resolvedDate.setHours(resolvedDate.getHours() + (data.daysTaken * 24)); // Resolved after X days

            const coords = LOCATIONS[data.loc];

            const complaint = new Complaint({
                userId: citizen._id,
                description: data.desc,
                location: data.loc,
                latitude: coords[0] + (Math.random() * 0.01), // Slight jitter
                longitude: coords[1] + (Math.random() * 0.01),
                department: data.dept,
                priority: data.pri,
                status: "RESOLVED",
                officerId: officer?._id,
                assignedDate: new Date(createdDate.getTime() + 3600000), // Assigned 1 hour later
                resolvedDate: resolvedDate,
                resolutionNotes: "Issue verified and resolved by field team.",
                createdAt: createdDate, // Manually set past date
                aiAnalysis: {
                    sentiment: "Neutral",
                    isHotspot: false,
                    isDuplicate: false
                }
            });

            await complaint.save();
            console.log(`✅ Resolved: ${data.desc} (${data.daysTaken} days)`);
        }

        console.log("\nDATA INJECTION COMPLETE! 🚀");
        console.log("Check Analytics for 'Avg Resolution Time' and 'Resolved' counts.");
        process.exit(0);
    } catch (error) {
        console.error("Seeding error:", error);
        process.exit(1);
    }
}

seedResolved();
