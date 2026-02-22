const mongoose = require('mongoose');
const Complaint = require('./models/Complaint');
const http = require('http');
require('dotenv').config();

async function analyze(text) {
    return new Promise((resolve) => {
        const data = JSON.stringify({ text });
        const options = {
            hostname: 'localhost',
            port: 5001,
            path: '/analyze-complaint',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    resolve({ department: 'General' });
                }
            });
        });
        req.on('error', (e) => resolve({ department: 'General' }));
        req.write(data);
        req.end();
    });
}

async function repair() {
    await mongoose.connect(process.env.MONGO_URI);
    const complaints = await Complaint.find({ department: 'General' });
    console.log(`Found ${complaints.length} General complaints to review.`);

    for (const c of complaints) {
        if (!c.description) continue;
        const result = await analyze(c.description);
        if (result.department && result.department !== 'General') {
            c.department = result.department;
            c.priority = result.priority || c.priority;
            await c.save();
            console.log(`Updated ID ${c._id}: ${result.department} - "${c.description.substring(0, 30)}..."`);
        }
    }

    console.log('Repair complete!');
    process.exit(0);
}

repair();
