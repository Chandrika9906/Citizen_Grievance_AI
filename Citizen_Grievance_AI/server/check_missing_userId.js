const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;

    const total = await db.collection('complaints').countDocuments();
    const noUserId = await db.collection('complaints').countDocuments({ userId: { $exists: false } });
    const nullUserId = await db.collection('complaints').countDocuments({ userId: null });

    console.log(`TOTAL: ${total}`);
    console.log(`NO_USER_ID: ${noUserId}`);
    console.log(`NULL_USER_ID: ${nullUserId}`);

    if (total > 0) {
        const sample = await db.collection('complaints').findOne();
        console.log(`SAMPLE_USER_ID: ${sample.userId}`);
    }

    process.exit(0);
}
check();
