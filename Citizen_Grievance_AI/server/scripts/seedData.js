const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Officer = require("../models/Officer");
const Complaint = require("../models/Complaint");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;

const LOCATION_COORDS = {
    'Chennai': [13.0827, 80.2707],
    'Coimbatore': [11.0168, 76.9558],
    'Madurai': [9.9252, 78.1198],
    'Tiruchirappalli': [10.7905, 78.7047],
    'Salem': [11.6643, 78.1460],
    'Tirunelveli': [8.7139, 77.7567],
    'Erode': [11.3410, 77.7172],
    'Vellore': [12.9165, 79.1325],
    'Thanjavur': [10.7870, 79.1378],
    'Dindigul': [10.3673, 77.9803],
    'Hosur': [12.7409, 77.8253]
};

const DEPARTMENTS = ["Roads", "Water", "Electricity", "Sanitation", "General"];

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB...");

        console.log("🚨 DEEP CLEAN: Wiping all complaints and test officers...");
        await Complaint.deleteMany({});
        await Officer.deleteMany({ email: { $regex: /_test/ } });

        console.log("Seeding test users...");
        const hashedPassword = await bcrypt.hash("password123", 10);

        const citizen = await User.findOneAndUpdate(
            { email: "citizen_test@example.com" },
            {
                name: "Test Citizen",
                email: "citizen_test@example.com",
                password: hashedPassword,
                role: "citizen"
            },
            { upsert: true, new: true }
        );

        console.log("Seeding test officers...");
        const officerData = [
            { name: "Officer Rajesh", email: "rajesh_test@example.com", department: "Roads" },
            { name: "Officer Priya", email: "priya_test@example.com", department: "Water" },
            { name: "Officer Kumar", email: "kumar_test@example.com", department: "Electricity" },
            { name: "Officer Anita", email: "anita_test@example.com", department: "Sanitation" }
        ];

        for (const data of officerData) {
            await Officer.create({
                ...data,
                password: hashedPassword,
                role: "officer",
                verified: true,
                status: "FREE"
            });
        }

        console.log("Generating 45 high-quality complaints...");
        const issueTypes = [
            { desc: "Major Pothole causing accidents", dept: "Roads", priority: 5 },
            { desc: "Water main burst, street flooding", dept: "Water", priority: 5 },
            { desc: "Transformer explosion, area blackout", dept: "Electricity", priority: 5 },
            { desc: "Toxic waste dumping near river", dept: "Sanitation", priority: 5 },
            { desc: "Street light flickering for weeks", dept: "Electricity", priority: 2 },
            { desc: "Garbage pile up outside community hall", dept: "Sanitation", priority: 3 },
            { desc: "Illegal parking blocking emergency exit", dept: "Roads", priority: 4 },
            { desc: "Low water pressure in high rises", dept: "Water", priority: 2 }
        ];

        const cities = Object.keys(LOCATION_COORDS);

        for (let i = 0; i < 45; i++) {
            const type = issueTypes[Math.floor(Math.random() * issueTypes.length)];
            const city = cities[Math.floor(Math.random() * cities.length)];
            const [lat, lng] = LOCATION_COORDS[city];

            await Complaint.create({
                userId: citizen._id,
                description: `[LIVE SEED] ${type.desc} at ${city} Junction ${Math.floor(Math.random() * 50) + 1}`,
                department: type.dept,
                priority: type.priority,
                latitude: lat + (Math.random() - 0.5) * 0.1,
                longitude: lng + (Math.random() - 0.5) * 0.1,
                status: "WAITING",
                aiAnalysis: {
                    sentiment: "critical",
                    isHotspot: Math.random() > 0.4,
                    isDuplicate: false
                }
            });
        }

        console.log("Seeding complete! 45 unique items injected. 🚀");
        process.exit(0);
    } catch (err) {
        console.error("Seeding error:", err);
        process.exit(1);
    }
}

seed();
