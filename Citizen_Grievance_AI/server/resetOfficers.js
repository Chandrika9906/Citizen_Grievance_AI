const mongoose = require("mongoose");
const Officer = require("./models/Officer");
require("dotenv").config();

async function reset() {
    await mongoose.connect(process.env.MONGO_URI);
    const res = await Officer.updateMany({}, { status: "FREE" });
    console.log(`✅ Success: Reset ${res.modifiedCount} officers to FREE status.`);
    process.exit(0);
}

reset();
