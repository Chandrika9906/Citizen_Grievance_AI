/**
 * MASTER SEED SCRIPT
 * Creates: 5 Officers + 10 Complaints (3 Critical, 3 High, 2 Medium, 2 Low)
 * with varied statuses: ASSIGNED, IN_PROGRESS, ONGOING, ALMOST_DONE, RESOLVED, WAITING
 * 
 * Run: node seed_master.js
 */

const mongoose = require("mongoose");
require("dotenv").config();
const bcrypt = require("bcryptjs");

const Officer = require("./models/Officer");
const Complaint = require("./models/Complaint");
const User = require("./models/User");

const OFFICERS = [
    { name: "John Ramesh", email: "john.ramesh@gov.in", department: "Roads", badge: "RD-001", phone: "9876501001" },
    { name: "Priya Lakshmi", email: "priya.lakshmi@gov.in", department: "Water", badge: "WT-002", phone: "9876501002" },
    { name: "Arjun Selvam", email: "arjun.selvam@gov.in", department: "Electricity", badge: "EL-003", phone: "9876501003" },
    { name: "Meena Devi", email: "meena.devi@gov.in", department: "Sanitation", badge: "SN-004", phone: "9876501004" },
    { name: "Karthik Rajan", email: "karthik.rajan@gov.in", department: "General", badge: "GN-005", phone: "9876501005" },
];

const COMPLAINTS_TEMPLATE = [
    // ---- CRITICAL (P5) ----
    {
        description: "Main water supply pipeline burst near Anna Nagar junction. Raw sewage mixing with drinking water. Immediate health hazard for 2000+ residents.",
        department: "Water", priority: 5, location: "Anna Nagar, Chennai",
        latitude: 13.0850, longitude: 80.2101, status: "IN_PROGRESS"
    },
    {
        description: "High-tension electric wire snapped and lying on road near bus stop. Risk of electrocution. Multiple vehicles passing.",
        department: "Electricity", priority: 5, location: "T. Nagar, Chennai",
        latitude: 13.0418, longitude: 80.2341, status: "ASSIGNED"
    },
    // ---- CRITICAL (P4) ----
    {
        description: "Major road collapse creating 4-foot deep crater on NH-48. Two vehicles already damaged. Emergency diversion needed.",
        department: "Roads", priority: 4, location: "Tambaram, Chennai",
        latitude: 12.9249, longitude: 80.1000, status: "ONGOING"
    },
    // ---- HIGH (P3) ----
    {
        description: "Garbage not collected for 10 days in residential area. Stray dogs and rats multiplying. Residents unable to leave homes.",
        department: "Sanitation", priority: 3, location: "Velachery, Chennai",
        latitude: 12.9815, longitude: 80.2180, status: "ALMOST_DONE"
    },
    {
        description: "Street lights non-functional for entire 2km stretch. Multiple chain snatching incidents reported after dark.",
        department: "Electricity", priority: 3, location: "Adyar, Chennai",
        latitude: 13.0012, longitude: 80.2565, status: "ASSIGNED"
    },
    {
        description: "Drainage overflow flooding residential streets. Mosquito breeding. Dengue cases reported in the area.",
        department: "Sanitation", priority: 3, location: "Perambur, Chennai",
        latitude: 13.1143, longitude: 80.2329, status: "WAITING"
    },
    // ---- MEDIUM (P2) ----
    {
        description: "Pothole on main road causing accidents. Two-wheelers skidding daily. Needs urgent patching.",
        department: "Roads", priority: 2, location: "Kodambakkam, Chennai",
        latitude: 13.0524, longitude: 80.2213, status: "RESOLVED"
    },
    {
        description: "Water supply irregular - only 30 minutes per day instead of 2 hours. Residents storing water in unsafe containers.",
        department: "Water", priority: 2, location: "Porur, Chennai",
        latitude: 13.0358, longitude: 80.1573, status: "RESOLVED"
    },
    // ---- LOW (P1) ----
    {
        description: "Park benches broken and rusty. Children getting injured. Needs replacement.",
        department: "General", priority: 1, location: "Nungambakkam, Chennai",
        latitude: 13.0569, longitude: 80.2425, status: "WAITING"
    },
    {
        description: "Street name board faded and unreadable. Causing confusion for delivery and emergency services.",
        department: "General", priority: 1, location: "Mylapore, Chennai",
        latitude: 13.0339, longitude: 80.2619, status: "WAITING"
    }
];

async function seedMaster() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // ---- 1. Get or create a test citizen ----
        let citizen = await User.findOne({ email: "citizen@test.com" });
        if (!citizen) {
            const hashed = await bcrypt.hash("password123", 10);
            citizen = new User({
                name: "Test Citizen",
                email: "citizen@test.com",
                password: hashed,
                role: "citizen"
            });
            await citizen.save();
            console.log("✅ Created test citizen");
        }

        // ---- 2. Seed Officers ----
        const hashed = await bcrypt.hash("password123", 10);
        const officerDocs = [];

        for (const data of OFFICERS) {
            let officer = await Officer.findOne({ email: data.email });
            if (!officer) {
                officer = new Officer({ ...data, password: hashed, status: "FREE", verified: true, role: "officer" });
                await officer.save();
                console.log(`✅ Officer created: ${officer.name} (${officer.department})`);
            } else {
                await Officer.findByIdAndUpdate(officer._id, { status: "FREE" });
                console.log(`⚠️  Officer exists: ${officer.name} — reset to FREE`);
            }
            officerDocs.push(officer);
        }

        // Map dept → officer
        const deptMap = {};
        officerDocs.forEach(o => { deptMap[o.department] = o; });

        // ---- 3. Seed Complaints ----
        console.log("\n🔄 Seeding 10 complaints...");

        for (const tmpl of COMPLAINTS_TEMPLATE) {
            const officer = deptMap[tmpl.department];
            const isActive = ["ASSIGNED", "IN_PROGRESS", "ONGOING", "ALMOST_DONE"].includes(tmpl.status);
            const isResolved = tmpl.status === "RESOLVED";

            // Create complaint
            const createdAt = new Date();
            createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 7 + 1));

            const assignedDate = isActive || isResolved ? new Date(createdAt.getTime() + 3600000) : null;
            const resolvedDate = isResolved ? new Date(assignedDate.getTime() + (Math.random() * 48 + 2) * 3600000) : null;

            const complaint = new Complaint({
                userId: citizen._id,
                description: tmpl.description,
                department: tmpl.department,
                priority: tmpl.priority,
                location: tmpl.location,
                latitude: tmpl.latitude,
                longitude: tmpl.longitude,
                status: tmpl.status,
                officerId: (isActive || isResolved) && officer ? officer._id : null,
                assignedDate,
                resolvedDate,
                resolutionNotes: isResolved ? "Issue verified and resolved by field team. Area inspected." : null,
                createdAt,
                aiAnalysis: { sentiment: "Negative", isHotspot: tmpl.priority >= 4, isDuplicate: false }
            });

            await complaint.save();

            // Mark officer BUSY if active
            if (isActive && officer) {
                await Officer.findByIdAndUpdate(officer._id, { status: "BUSY" });
            }

            const icon = tmpl.priority >= 4 ? "🔴" : tmpl.priority === 3 ? "🟠" : tmpl.priority === 2 ? "🟡" : "🟢";
            console.log(`  ${icon} P${tmpl.priority} [${tmpl.status}] ${tmpl.department}: ${tmpl.description.substring(0, 50)}...`);
        }

        // ---- 4. Summary ----
        const counts = await Complaint.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);
        console.log("\n📊 COMPLAINT STATUS SUMMARY:");
        counts.forEach(c => console.log(`   ${c._id}: ${c.count}`));

        const officerStatus = await Officer.find({}, "name department status");
        console.log("\n👮 OFFICER STATUS:");
        officerStatus.forEach(o => console.log(`   ${o.name} (${o.department}): ${o.status}`));

        console.log("\n🚀 SEED COMPLETE! Dashboard will now show real data.");
        console.log("   Login: citizen@test.com / password123");
        console.log("   Officers: john.ramesh@gov.in / password123 (etc.)");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seed error:", err);
        process.exit(1);
    }
}

seedMaster();
