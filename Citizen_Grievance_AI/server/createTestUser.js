const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

async function createTestUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected ✅");

    // Check if user already exists
    const existing = await User.findOne({ email: "test@test.com" });
    if (existing) {
      console.log("User already exists!");
      process.exit(0);
    }

    // Create test user
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    const testUser = new User({
      name: "Test User",
      email: "test@test.com",
      password: hashedPassword,
      role: "citizen",
      phone: "+91 9876543210",
      address: "Test Address",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600001"
    });

    await testUser.save();
    
    console.log("\n✅ Test user created successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Email:    test@test.com");
    console.log("Password: password123");
    console.log("Role:     Citizen");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

createTestUser();
