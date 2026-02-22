const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await mongoose.connection.db.collection('users').findOne({ _id: new mongoose.Types.ObjectId('6994943179d6619e950dc6a1') });
    console.log("USER_EMAIL:", user ? user.email : "NOT FOUND");
    process.exit(0);
}
check();
