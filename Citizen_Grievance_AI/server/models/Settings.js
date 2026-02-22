const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },
  pushNotifications: {
    type: Boolean,
    default: true
  },
  smsNotifications: {
    type: Boolean,
    default: false
  },
  complaintUpdates: {
    type: Boolean,
    default: true
  },
  systemUpdates: {
    type: Boolean,
    default: false
  },
  language: {
    type: String,
    default: 'en'
  },
  autoSave: {
    type: Boolean,
    default: true
  },
  twoFactor: {
    type: Boolean,
    default: false
  },
  darkMode: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Static method to get or create settings
settingsSchema.statics.getOrCreate = async function(userId) {
  let settings = await this.findOne({ userId });
  if (!settings) {
    settings = await this.create({ userId });
  }
  return settings;
};

module.exports = mongoose.model("Settings", settingsSchema);
