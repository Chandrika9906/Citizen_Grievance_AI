const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");
const Officer = require("./models/Officer");
const Complaint = require("./models/Complaint");
const { autoAssignOfficer } = require("./utils/assignmentHelper");

const TEST_COMPLAINTS = [
    // 🔴 CRITICAL PRIORITY (7 complaints)
    { description: "URGENT! Gas pipeline leak detected near residential area. Immediate evacuation needed!", location: "Chennai", lat: 13.0827, lng: 80.2707, dept: "General", priority: 3 },
    { description: "Emergency! Bridge collapse risk - structural damage visible. Traffic must be stopped immediately!", location: "Coimbatore", lat: 11.0168, lng: 76.9558, dept: "Roads", priority: 3 },
    { description: "CRITICAL: Hospital generator failed during surgery. Backup power needed NOW!", location: "Madurai", lat: 9.9252, lng: 78.1198, dept: "Electricity", priority: 3 },
    { description: "DANGER! Chemical spill from factory truck on main highway. Toxic fumes spreading!", location: "Trichy", lat: 10.7905, lng: 78.7047, dept: "Health", priority: 3 },
    { description: "EMERGENCY: School building fire alarm system malfunctioned during drill. Safety risk!", location: "Salem", lat: 11.6643, lng: 78.1460, dept: "General", priority: 3 },
    { description: "URGENT! Water contamination detected in main supply line. Entire district affected!", location: "Vellore", lat: 12.9165, lng: 79.1325, dept: "Water", priority: 3 },
    { description: "CRITICAL: Sewage overflow into children's playground. Health emergency!", location: "Erode", lat: 11.3410, lng: 77.7172, dept: "Sanitation", priority: 3 },

    // 🟡 NORMAL PRIORITY (7 complaints)
    { description: "Street lights not working for past week in residential area. Safety concern for women.", location: "Tirunelveli", lat: 8.7139, lng: 77.7567, dept: "Electricity", priority: 2 },
    { description: "Garbage collection irregular. Waste piling up near apartment complex for 4 days.", location: "Chennai", lat: 13.0475, lng: 80.2090, dept: "Sanitation", priority: 2 },
    { description: "Road has multiple potholes causing vehicle damage. Repair needed urgently.", location: "Coimbatore", lat: 11.0200, lng: 76.9600, dept: "Roads", priority: 2 },
    { description: "Public toilet facility broken lock and poor maintenance. Needs immediate attention.", location: "Madurai", lat: 9.9312, lng: 78.1215, dept: "General", priority: 2 },
    { description: "Water pressure very low in morning hours. Affects daily routine of residents.", location: "Trichy", lat: 10.8000, lng: 78.7100, dept: "Water", priority: 2 },
    { description: "Stray dogs increasing in number near market area. Vaccination drive needed.", location: "Salem", lat: 11.6700, lng: 78.1500, dept: "Health", priority: 2 },
    { description: "Traffic signal timing needs adjustment. Long waiting time during peak hours.", location: "Vellore", lat: 12.9200, lng: 79.1400, dept: "Roads", priority: 2 },

    // 🟢 LOW PRIORITY (6 complaints)
    { description: "Park benches need repainting and minor repairs for better appearance.", location: "Erode", lat: 11.3500, lng: 77.7200, dept: "General", priority: 1 },
    { description: "Request for additional dustbins near bus stop for cleanliness.", location: "Tirunelveli", lat: 8.7200, lng: 77.7600, dept: "Sanitation", priority: 1 },
    { description: "Tree branches growing near power lines. Trimming required for safety.", location: "Chennai", lat: 13.0600, lng: 80.2500, dept: "Electricity", priority: 1 },
    { description: "Suggestion to install speed breakers near school zone for child safety.", location: "Coimbatore", lat: 11.0300, lng: 76.9700, dept: "Roads", priority: 1 },
    { description: "Public garden needs more flowering plants and better landscaping.", location: "Madurai", lat: 9.9400, lng: 78.1300, dept: "General", priority: 1 },
    { description: "Request for covered waiting area at bus stop during rainy season.", location: "Trichy", lat: 10.8100, lng: 78.7200, dept: "General", priority: 1 }
];

async function seedTestComplaints() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB ✅");

        // Find or create a test user
        let citizen = await User.findOne({ email: "citizen@test.com" });
        if (!citizen) {
            citizen = await User.findOne({ role: "citizen" });
            if (!citizen) {
                console.log("❌ No citizen user found. Creating test user...");
                citizen = new User({
                    name: "Test Citizen",
                    email: "testcitizen@example.com",
                    password: "hashedpassword",
                    role: "citizen",
                    phone: "9876543210"
                });
                await citizen.save();
                console.log("✅ Test citizen user created");
            }
        }

        console.log("Seeding 20 test complaints... 📥");
        console.log("Distribution: 7 Critical, 7 Normal, 6 Low priority\n");

        let criticalCount = 0, normalCount = 0, lowCount = 0;

        for (const data of TEST_COMPLAINTS) {
            const complaint = new Complaint({
                userId: citizen._id,
                description: data.description,
                latitude: data.lat,
                longitude: data.lng,
                department: data.dept,
                priority: data.priority,
                status: "WAITING",
                aiAnalysis: {
                    sentiment: data.priority === 3 ? "Negative" : data.priority === 2 ? "Neutral" : "Positive",
                    isHotspot: data.priority === 3,
                    isDuplicate: false
                }
            });

            const saved = await complaint.save();
            
            // Count by priority
            if (data.priority === 3) criticalCount++;
            else if (data.priority === 2) normalCount++;
            else lowCount++;

            const priorityLabel = data.priority === 3 ? "CRITICAL" : data.priority === 2 ? "NORMAL" : "LOW";
            console.log(`✅ [${priorityLabel}] ${data.description.substring(0, 50)}...`);

            // Try auto-assignment
            try {
                await autoAssignOfficer(saved._id, saved.department);
            } catch (assignError) {
                console.log(`   ⚠️  Auto-assignment failed: ${assignError.message}`);
            }
        }

        console.log("\n📊 SUMMARY:");
        console.log(`🔴 Critical Priority: ${criticalCount} complaints`);
        console.log(`🟡 Normal Priority: ${normalCount} complaints`);
        console.log(`🟢 Low Priority: ${lowCount} complaints`);
        console.log(`📝 Total: ${TEST_COMPLAINTS.length} complaints added successfully!`);
        console.log("\n✅ All test complaints have been added to the database and will reflect in your application!");
        
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding error:", error);
        process.exit(1);
    }
}

seedTestComplaints();