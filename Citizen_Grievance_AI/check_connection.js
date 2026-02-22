// Quick script to check if backend and database are connected properly
const axios = require('axios');

async function checkConnection() {
    console.log('🔍 Checking System Connections...\n');

    // Check Backend
    try {
        const backendHealth = await axios.get('http://localhost:5000/api/complaints', { timeout: 3000 });
        console.log('✅ Backend Server: RUNNING');
        console.log(`   Found ${backendHealth.data.length} complaints in database`);
    } catch (err) {
        console.log('❌ Backend Server: NOT RUNNING or ERROR');
        console.log('   Start with: cd server && npm run dev');
        return;
    }

    // Check Frontend
    try {
        await axios.get('http://localhost:5173', { timeout: 3000 });
        console.log('✅ Frontend: RUNNING');
    } catch (err) {
        console.log('❌ Frontend: NOT RUNNING');
        console.log('   Start with: cd client && npm run dev');
    }

    // Check AI Service
    try {
        await axios.get('http://localhost:5001', { timeout: 3000 });
        console.log('✅ AI Service: RUNNING');
    } catch (err) {
        console.log('⚠️  AI Service: NOT RUNNING (Optional)');
        console.log('   Start with: cd ai-service && python app.py');
    }

    console.log('\n✨ System Check Complete!');
}

checkConnection().catch(err => {
    console.error('Error running check:', err.message);
});
