const mongoose = require('mongoose');
require('dotenv').config();

async function checkOfficers() {
    await mongoose.connect(process.env.MONGO_URI);
    const officers = await mongoose.connection.db.collection('officers').find().toArray();
    console.log("OFFICERS_COUNT: " + officers.length);
    officers.forEach(o => {
        console.log(`Officer: ${o.name}, Dept: ${o.department}, Status: ${o.status}, Verified: ${o.verified}`);
    });
    process.exit(0);
}
checkOfficers();
