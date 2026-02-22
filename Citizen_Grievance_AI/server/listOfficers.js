const mongoose = require("mongoose");
const Officer = require("./models/Officer");
require("dotenv").config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const officers = await Officer.find();
    console.log("All Officers in DB:");
    officers.forEach(o => {
        console.log(`- ${o.name} (${o.email}): Dept: ${o.department}, Status: ${o.status}, Verified: ${o.verified}`);
    });
    process.exit(0);
}

check();
