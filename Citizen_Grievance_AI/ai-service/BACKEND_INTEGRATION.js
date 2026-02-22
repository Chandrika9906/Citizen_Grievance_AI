/**
 * BACKEND INTEGRATION EXAMPLE
 * 
 * Show this to your backend team - it's just 2-3 lines of code!
 */

// ============================================
// OPTION 1: Use Complete Analysis (Recommended)
// ============================================

// In your complaintRoutes.js
router.post("/create", async (req, res) => {
  try {
    const { userId, description, latitude, longitude } = req.body;

    // 🤖 CALL AI SERVICE (Just 1 API call!)
    const aiResponse = await fetch('http://localhost:5001/analyze-complaint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: description,
        latitude: latitude,
        longitude: longitude,
        userId: userId
      })
    });

    const aiResult = await aiResponse.json();

    // ✅ Use AI results
    const newComplaint = new Complaint({
      userId,
      description,
      latitude,
      longitude,
      department: aiResult.department,        // AI detected
      priority: aiResult.priority,            // AI calculated
      sentiment: aiResult.sentiment,          // AI analyzed
      isHotspot: aiResult.hotspot.is_hotspot, // AI detected
      isDuplicate: aiResult.duplicate.is_duplicate // AI detected
    });

    await newComplaint.save();

    res.json({
      message: "Complaint submitted successfully",
      aiAnalysis: aiResult
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ============================================
// OPTION 2: Use Individual AI Features
// ============================================

router.post("/create", async (req, res) => {
  try {
    const { userId, description, latitude, longitude } = req.body;

    // Call individual AI endpoints
    const deptResponse = await fetch('http://localhost:5001/classify-department', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: description })
    });
    const { department } = await deptResponse.json();

    const priorityResponse = await fetch('http://localhost:5001/predict-priority', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: description, latitude, longitude })
    });
    const { priority } = await priorityResponse.json();

    // Save complaint
    const newComplaint = new Complaint({
      userId,
      description,
      latitude,
      longitude,
      department,
      priority
    });

    await newComplaint.save();

    res.json({
      message: "Complaint submitted successfully",
      department,
      priority
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ============================================
// OPTION 3: Make AI Optional (Fallback)
// ============================================

router.post("/create", async (req, res) => {
  try {
    const { userId, description, latitude, longitude } = req.body;

    let department = "General";
    let priority = 1;

    // Try AI service, fallback to basic logic if it fails
    try {
      const aiResponse = await fetch('http://localhost:5001/analyze-complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: description,
          latitude,
          longitude,
          userId
        })
      });

      if (aiResponse.ok) {
        const aiResult = await aiResponse.json();
        department = aiResult.department;
        priority = aiResult.priority;
      }
    } catch (aiError) {
      console.log("AI service unavailable, using fallback");
      // Use your existing basic logic
      department = detectDepartment(description);
      priority = detectPriority(description);
    }

    const newComplaint = new Complaint({
      userId,
      description,
      latitude,
      longitude,
      department,
      priority
    });

    await newComplaint.save();

    res.json({
      message: "Complaint submitted successfully",
      department,
      priority
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ============================================
// VOICE COMPLAINT EXAMPLE
// ============================================

router.post("/create-voice", async (req, res) => {
  try {
    const audioFile = req.files.audio; // Using multer or similar

    // Convert voice to text
    const formData = new FormData();
    formData.append('audio', audioFile);

    const voiceResponse = await fetch('http://localhost:5001/voice-to-text', {
      method: 'POST',
      body: formData
    });

    const { text } = await voiceResponse.json();

    // Now analyze the text
    const aiResponse = await fetch('http://localhost:5001/analyze-complaint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        userId: req.body.userId
      })
    });

    const aiResult = await aiResponse.json();

    // Save complaint
    const newComplaint = new Complaint({
      userId: req.body.userId,
      description: text,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      department: aiResult.department,
      priority: aiResult.priority
    });

    await newComplaint.save();

    res.json({
      message: "Voice complaint submitted",
      transcription: text,
      aiAnalysis: aiResult
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ============================================
// IMAGE COMPLAINT EXAMPLE
// ============================================

router.post("/create-image", async (req, res) => {
  try {
    const imageFile = req.files.image;

    // Classify image
    const formData = new FormData();
    formData.append('image', imageFile);

    const imageResponse = await fetch('http://localhost:5001/classify-image', {
      method: 'POST',
      body: formData
    });

    const imageResult = await imageResponse.json();

    // Save complaint
    const newComplaint = new Complaint({
      userId: req.body.userId,
      description: req.body.description || "Image complaint",
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      department: imageResult.department,
      priority: 2, // Image complaints are medium priority
      imageUrl: imageFile.path
    });

    await newComplaint.save();

    res.json({
      message: "Image complaint submitted",
      imageAnalysis: imageResult
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ============================================
// SUMMARY FOR BACKEND TEAM
// ============================================

/*
 * INTEGRATION STEPS:
 * 
 * 1. Make sure AI service is running (http://localhost:5001)
 * 2. Replace your detectDepartment() and detectPriority() functions
 *    with a simple fetch() call to AI service
 * 3. That's it! 🎉
 * 
 * BENEFITS:
 * - Much better accuracy than keyword matching
 * - Sentiment analysis included
 * - Hotspot detection included
 * - Duplicate detection included
 * - Easy to improve AI without touching backend code
 * 
 * DEPLOYMENT:
 * - Deploy AI service separately (Docker/AWS/Heroku)
 * - Update URL from localhost:5001 to production URL
 * - Done!
 */
