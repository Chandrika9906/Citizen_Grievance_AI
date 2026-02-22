const mongoose = require("mongoose");
const Officer = require("./models/Officer");
require("dotenv").config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const officers = await Officer.find();
    console.log("SURVEYING ALL OFFICERS:");
    officers.forEach(o => {
        console.log(`- NAME: ${o.name} | DEPT: ${o.department} | STATUS: ${o.status} | VERIFIED: ${o.verified}`);
    });
    console.log("TOTAL RECOGNIZED:", officers.length);
    process.exit(0);
}

check();
