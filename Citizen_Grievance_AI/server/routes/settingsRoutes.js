const express = require("express");
const Settings = require("../models/Settings");

const router = express.Router();

/* ======================================================
   VERIFY
====================================================== TOKEN MIDDLEWARE */
const verifyToken = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = header.split(" ")[1];

  try {
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

/* ======================================================
   GET USER SETTINGS
====================================================== */
router.get("/", verifyToken, async (req, res) => {
  try {
    const settings = await Settings.getOrCreate(req.userId);
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   UPDATE USER SETTINGS
====================================================== */
router.put("/", verifyToken, async (req, res) => {
  try {
    const allowedUpdates = [
      'emailNotifications',
      'pushNotifications',
      'smsNotifications',
      'complaintUpdates',
      'systemUpdates',
      'language',
      'autoSave',
      'twoFactor',
      'darkMode'
    ];

    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const settings = await Settings.findOneAndUpdate(
      { userId: req.userId },
      { $set: updates },
      { new: true, runValidators: true, upsert: true }
    );

    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
