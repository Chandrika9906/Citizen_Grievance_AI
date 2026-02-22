const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;

    const total = await db.collection('complaints').countDocuments();
    const withUser = await db.collection('complaints').countDocuments({ userId: { $exists: true, $ne: null } });

    console.log(`TOTAL_COMPLAINTS: ${total}`);
    console.log(`WITH_USER_ID: ${withUser}`);

    const all = await db.collection('complaints').find().toArray();
    all.forEach((c, i) => {
        console.log(`${i}: ID=${c._id}, userId=${c.userId}`);
    });

    process.exit(0);
}
check();
