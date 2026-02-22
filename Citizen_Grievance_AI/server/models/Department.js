const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  headName: {
    type: String,
    default: ""
  },
  headEmail: {
    type: String,
    default: ""
  },
  phone: {
    type: String,
    default: ""
  },
  officerCount: {
    type: Number,
    default: 0
  },
  activeComplaints: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Index for efficient querying
departmentSchema.index({ name: 1 });
departmentSchema.index({ isActive: 1 });

module.exports = mongoose.model("Department", departmentSchema);
