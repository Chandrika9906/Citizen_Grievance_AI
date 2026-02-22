const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const collections = await mongoose.connection.db.listCollections().toArray();
    const names = collections.map(c => c.name);
    console.log("COLLECTIONS_ARE: " + names.join(", "));

    const complaints = await mongoose.connection.db.collection('complaints').countDocuments();
    console.log("COMPLAINTS_COUNT: " + complaints);

    const users = await mongoose.connection.db.collection('users').countDocuments();
    console.log("USERS_COUNT: " + users);

    process.exit(0);
}
check();
