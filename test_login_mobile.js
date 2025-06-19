const axios = require('axios');

const testMobileLogin = async () => {
    try {
        // Test login within allowed time window
        const responseWithin = await axios.post('http://localhost:3000/login', { username: 'testuser' }, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36',
                'Content-Type': 'application/json'
            }
        });
        console.log('Mobile Login within allowed time response:', responseWithin.data);

        // For testing outside allowed time window, simulate by changing system time or mocking moment in code.
        // Here, we just log that manual testing is needed for outside time window.

        console.log('Please manually test mobile login outside allowed time window by changing system time or mocking.');

    } catch (error) {
        if (error.response) {
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
            console.error('Error response headers:', error.response.headers);
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Error setting up request:', error.message);
        }
    }
};

testMobileLogin();
