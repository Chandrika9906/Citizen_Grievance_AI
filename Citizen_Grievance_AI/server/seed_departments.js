const mongoose = require('mongoose');
const Department = require('./models/Department');
require('dotenv').config();

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);

    const depts = [
        { name: 'Sanitation', description: 'Waste management and cleaning' },
        { name: 'Water', description: 'Water supply and pipe maintenance' },
        { name: 'Road', description: 'Road repair and street lights' },
        { name: 'Electricity', description: 'Power supply and electric poles' },
        { name: 'Public Safety', description: 'Security and emergency services' },
        { name: 'General', description: 'Miscellaneous complaints' }
    ];

    for (const d of depts) {
        await Department.findOneAndUpdate({ name: d.name }, d, { upsert: true });
        console.log(`Seeded: ${d.name}`);
    }

    console.log('All departments seeded!');
    process.exit(0);
}

seed();
