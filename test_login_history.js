const axios = require('axios');

const testLoginHistory = async () => {
    try {
        // Test with valid user email
        const validEmail = 'user@example.com';
        const responseValid = await axios.get(`http://localhost:3000/user/login-history?email=${encodeURIComponent(validEmail)}`);
        console.log('Login history for valid user:', responseValid.data);

        // Test with invalid user email
        const invalidEmail = 'nonexistent@example.com';
        try {
            await axios.get(`http://localhost:3000/user/login-history?email=${encodeURIComponent(invalidEmail)}`);
        } catch (error) {
            if (error.response) {
                console.log('Expected error for invalid user:', error.response.data);
            } else {
                console.error('Error testing invalid user:', error);
            }
        }

        // Test with missing email parameter
        try {
            await axios.get('http://localhost:3000/user/login-history');
        } catch (error) {
            if (error.response) {
                console.log('Expected error for missing email:', error.response.data);
            } else {
                console.error('Error testing missing email:', error);
            }
        }
    } catch (error) {
        console.error('Error testing login history API:', error);
    }
};

testLoginHistory();
