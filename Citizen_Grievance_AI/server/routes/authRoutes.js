const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Officer = require("../models/Officer");

const router = express.Router();

/* ======================================================
   🔐 VERIFY TOKEN MIDDLEWARE
====================================================== */
const verifyToken = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

/* ======================================================
   👤 CITIZEN REGISTER
====================================================== */
/* ======================================================
   👤 REGISTER (CITIZEN & OFFICER)
====================================================== */
router.post("/register", async (req, res) => {
  try {
    console.log("📝 Register Request Received:", req.body);
    const { name, email, password, phone, address, role, department, badge } = req.body;

    if (role === 'officer') {
      // Check existing officer
      const existingOfficer = await Officer.findOne({ email });
      if (existingOfficer) {
        return res.status(400).json({ message: "Officer already exists with this email" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newOfficer = new Officer({
        name,
        email,
        password: hashedPassword,
        phone,
        department,
        badge,
        role: "officer",
        status: "FREE",
        verified: true // Auto-verify for demo purposes
      });

      await newOfficer.save();
      res.json({ message: "Officer Registered Successfully ✅" });

    } else {
      // Default: Citizen
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        role: "citizen"
      });

      await newUser.save();
      res.json({ message: "Citizen Registered Successfully ✅" });
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   🔐 CITIZEN LOGIN
====================================================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login Successful ✅",
      token,
      role: user.role
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   👮 OFFICER LOGIN (NO SELF REGISTER)
====================================================== */
router.post("/officer-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const officer = await Officer.findOne({ email });

    if (!officer) {
      return res.status(400).json({ message: "Officer not found" });
    }

    if (!officer.verified) {
      return res.status(403).json({ message: "Officer not verified" });
    }

    const isMatch = await bcrypt.compare(password, officer.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: officer._id, role: officer.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Officer Login Successful ✅",
      token,
      role: officer.role
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   📄 GET USER PROFILE
====================================================== */
/* ======================================================
   📄 GET USER PROFILE
====================================================== */
router.get("/profile", verifyToken, async (req, res) => {
  try {
    let user;
    if (req.userRole === 'officer') {
      user = await Officer.findById(req.userId).select("-password");
    } else {
      user = await User.findById(req.userId).select("-password");
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure role is included in response
    const userData = user.toObject();
    userData.role = req.userRole;

    res.json(userData);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   ✏️ UPDATE USER PROFILE
====================================================== */
router.put("/profile", verifyToken, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
