const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const complaint = await mongoose.connection.db.collection('complaints').findOne();
    if (complaint) {
        console.log("COMPLAINT_USER_ID: " + complaint.userId);
        console.log("USER_ID_TYPE: " + typeof complaint.userId);
        console.log("IS_OBJECT_ID: " + (complaint.userId instanceof mongoose.Types.ObjectId));
    } else {
        console.log("NO_COMPLAINTS_FOUND");
    }
    process.exit(0);
}
check();
