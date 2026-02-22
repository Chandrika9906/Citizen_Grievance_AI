const mongoose = require("mongoose");
require("dotenv").config();
const Complaint = require("./models/Complaint");
const Officer = require("./models/Officer");
const { autoAssignOfficer } = require("./utils/assignmentHelper");

async function checkAndReassign() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // 1. Group Waiting by Dept
        const waiting = await Complaint.aggregate([
            { $match: { status: "WAITING" } },
            { $group: { _id: "$department", count: { $sum: 1 } } }
        ]);

        console.log("WAITING COMPLAINTS BY DEPT:", waiting);

        if (waiting.length === 0) {
            console.log("No waiting complaints found anywhere!");
            process.exit(0);
        }

        const busiestDept = waiting.sort((a, b) => b.count - a.count)[0]._id;
        console.log(`Busiest Dept is: ${busiestDept}`);

        // 2. Find Test Officer
        const email = "officer@test.com";
        const officer = await Officer.findOne({ email });

        if (officer) {
            // Change Dept
            console.log(`Switching officer ${email} from ${officer.department} to ${busiestDept}...`);
            await Officer.findByIdAndUpdate(officer._id, {
                department: busiestDept,
                status: "FREE"
            });

            // Trigger Assignment
            const complaint = await Complaint.findOne({ department: busiestDept, status: "WAITING" });
            if (complaint) {
                console.log(`Assigning ${complaint._id} (${busiestDept}) to officer...`);
                await autoAssignOfficer(complaint._id, busiestDept);
                console.log("ASSIGNED!");
            }
        }

        process.exit(0);
    } catch (e) { console.error(e); process.exit(1); }
}

checkAndReassign();
