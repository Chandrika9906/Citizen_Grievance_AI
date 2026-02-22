const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const complaint = await mongoose.connection.db.collection('complaints').findOne({}, { sort: { createdAt: -1 } });
    console.log("LATEST_COMPLAINT:", JSON.stringify(complaint, null, 2));
    process.exit(0);
}
check();
