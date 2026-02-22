const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  description: String,
  latitude: Number,
  longitude: Number,
  department: String,
  priority: Number,
  status: {
    type: String,
    enum: ["WAITING", "ASSIGNED", "IN_PROGRESS", "ONGOING", "ALMOST_DONE", "RESOLVED", "REJECTED"],
    default: "WAITING"
  },
  officerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Officer",
    default: null
  },
  // New fields for lifecycle tracking
  assignedDate: Date,
  resolvedDate: Date,
  resolutionNotes: String,
  rejectionReason: String,
  imageUrl: String,
  aiAnalysis: {
    sentiment: String,
    isHotspot: Boolean,
    isDuplicate: Boolean
  }
}, { timestamps: true });

module.exports = mongoose.model("Complaint", complaintSchema);
