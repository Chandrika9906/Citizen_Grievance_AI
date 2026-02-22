const mongoose = require("mongoose");

const officerMasterSchema = new mongoose.Schema({
  empId: { type: String, unique: true },
  name: String,
  department: String,
  email: String
});

module.exports = mongoose.model("OfficerMaster", officerMasterSchema);
