const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const count = await mongoose.connection.db.collection('complaints').countDocuments({ department: { $ne: 'General' } });
    const total = await mongoose.connection.db.collection('complaints').countDocuments();
    console.log(`NON-GENERAL: ${count} / ${total}`);

    const depts = await mongoose.connection.db.collection('complaints').distinct('department');
    console.log('Unique Departments:', depts);

    process.exit(0);
}
check();
