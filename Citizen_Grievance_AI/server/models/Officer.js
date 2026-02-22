const mongoose = require("mongoose");

const officerSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  department: String,
  phone: { type: String, default: "" },
  badge: { type: String, default: "" },
  status: { type: String, default: "FREE" },
  verified: { type: Boolean, default: false },
  role: { type: String, default: "officer" }
});

module.exports = mongoose.model("Officer", officerSchema);
