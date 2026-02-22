const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");
const Officer = require("./models/Officer");
const Department = require("./models/Department");
const Complaint = require("./models/Complaint");

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected ✅");

    // Clear existing data
    await User.deleteMany({});
    await Officer.deleteMany({});
    await Department.deleteMany({});
    await Complaint.deleteMany({}); // Clear complaints too
    console.log("Existing data cleared 🗑️");

    // Create test citizen
    const hashedPassword = await bcrypt.hash("password123", 10);

    const testCitizen = await User.create({
      name: "Test Citizen",
      email: "citizen@test.com",
      password: hashedPassword,
      role: "citizen",
      phone: "+91 9876543210",
      address: "123 Test Street",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600001"
    });
    console.log("✅ Test Citizen created: citizen@test.com / password123");

    // Create test admin
    const testAdmin = await User.create({
      name: "Admin User",
      email: "admin@test.com",
      password: hashedPassword,
      role: "admin",
      phone: "+91 9876543211",
      address: "Admin Office",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600001"
    });
    console.log("✅ Test Admin created: admin@test.com / password123");

    // Create departments
    const departmentsData = [
      { name: "Roads", description: "Road maintenance and infrastructure", headName: "Rajesh Kumar", headEmail: "rajesh@roads.gov.in", phone: "+91 9876543212" },
      { name: "Water", description: "Water supply and drainage", headName: "Priya Sharma", headEmail: "priya@water.gov.in", phone: "+91 9876543213" },
      { name: "Electricity", description: "Power supply and street lights", headName: "Amit Patel", headEmail: "amit@electricity.gov.in", phone: "+91 9876543214" },
      { name: "Sanitation", description: "Waste management and cleanliness", headName: "Lakshmi Iyer", headEmail: "lakshmi@sanitation.gov.in", phone: "+91 9876543215" },
      { name: "Health", description: "Public health and hospitals", headName: "Dr. Suresh Reddy", headEmail: "suresh@health.gov.in", phone: "+91 9876543216" }
    ];

    const createdDepartments = [];
    for (const dept of departmentsData) {
      const newDept = await Department.create(dept);
      createdDepartments.push(newDept);
      console.log(`✅ Department created: ${dept.name}`);
    }

    // Create test officer
    const testOfficer = await Officer.create({
      name: "Officer John",
      email: "officer@test.com",
      password: hashedPassword,
      role: "officer",
      department: "Roads",
      status: "FREE",
      verified: true
    });
    console.log("✅ Test Officer created: officer@test.com / password123");

    // Create sample complaints
    console.log("Creating sample complaints... ⏳");

    const complaintStatuses = ["WAITING", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "REJECTED"];
    const priorities = [1, 2, 3, 4, 5]; // 1: Low, ... 5: Critical

    // Helper to get random date within last N days
    const getRandomDate = (daysAgo) => {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
      return date;
    };

    const sampleComplaints = [];

    // Generate 30 random complaints
    for (let i = 0; i < 30; i++) {
      const status = complaintStatuses[Math.floor(Math.random() * complaintStatuses.length)];
      const dept = departmentsData[Math.floor(Math.random() * departmentsData.length)].name;
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const date = getRandomDate(30);

      const complaint = {
        userId: testCitizen._id,
        description: `Sample complaint description #${i + 1} regarding ${dept} issue. This is a generated test complaint.`,
        latitude: 13.0827 + (Math.random() * 0.1 - 0.05), // Around Chennai
        longitude: 80.2707 + (Math.random() * 0.1 - 0.05),
        department: dept,
        priority: priority,
        status: status,
        officerId: status !== "WAITING" && status !== "REJECTED" ? testOfficer._id : null,
        assignedDate: status !== "WAITING" ? date : null, // Simplification
        resolvedDate: status === "RESOLVED" ? new Date(date.getTime() + 86400000) : null,
        resolutionNotes: status === "RESOLVED" ? "Issue has been resolved successfully." : null,
        imageUrl: "https://via.placeholder.com/150",
        aiAnalysis: {
          sentiment: Math.random() > 0.5 ? "Negative" : "Neutral",
          isHotspot: Math.random() > 0.8,
          isDuplicate: false
        },
        createdAt: date,
        updatedAt: date
      };
      sampleComplaints.push(complaint);
    }

    await Complaint.insertMany(sampleComplaints);
    console.log(`✅ Default 30 sample complaints created.`);

    console.log("\n🎉 Database seeded successfully!");
    console.log("\nTest Accounts:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Citizen: citizen@test.com / password123");
    console.log("Officer: officer@test.com / password123");
    console.log("Admin:   admin@test.com / password123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
