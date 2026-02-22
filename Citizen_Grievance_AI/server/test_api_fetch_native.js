const http = require('http');

http.get('http://localhost:5000/api/complaints', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log('COUNT:', Array.isArray(json) ? json.length : (json.complaints ? json.complaints.length : 'UNKNOWN_FORMAT'));
            if (Array.isArray(json) && json.length > 0) {
                console.log('SAMPLE_USER_ID:', json[0].userId);
            } else if (json.complaints && json.complaints.length > 0) {
                console.log('SAMPLE_USER_ID:', json.complaints[0].userId);
            }
        } catch (e) {
            console.log('Parse error:', e.message);
            console.log('Raw data head:', data.substring(0, 100));
        }
    });
}).on('error', (err) => {
    console.log('Error:', err.message);
});
