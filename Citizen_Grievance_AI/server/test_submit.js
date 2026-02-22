async function testSubmit() {
    try {
        const payload = {
            userId: "66f935f20f5f5678bf436e5d",
            description: "TEST COMPLAINT FROM AGENT " + Date.now(),
            latitude: 13.0,
            longitude: 80.0,
            department: "General",
            priority: 1,
            aiAnalysis: {
                sentiment: "neutral",
                isHotspot: false,
                isDuplicate: false
            }
        };

        console.log("Submitting to http://localhost:5000/api/complaints/create ...");
        const response = await fetch('http://localhost:5000/api/complaints/create', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log("Response:", data);

        if (data.data && data.data._id) {
            console.log("✅ SUCCESS: Created complaint with ID " + data.data._id);
        } else {
            console.log("❌ FAILED: Response did not include ID");
        }
    } catch (err) {
        console.error("❌ ERROR:", err.message);
    }
}

testSubmit();
