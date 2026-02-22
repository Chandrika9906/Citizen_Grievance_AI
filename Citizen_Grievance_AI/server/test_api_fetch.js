const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function testFetch() {
    try {
        const res = await fetch('http://localhost:5000/api/complaints');
        const data = await res.json();
        console.log('COUNT:', Array.isArray(data) ? data.length : 'NOT_ARRAY');
        if (Array.isArray(data) && data.length > 0) {
            console.log('SAMPLE_USER_ID:', data[0].userId);
        } else {
            console.log('DATA:', data);
        }
    } catch (err) {
        console.error('ERROR:', err.message);
    }
}
testFetch();
