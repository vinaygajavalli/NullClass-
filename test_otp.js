const axios = require('axios');

const testAudioUpload = async () => {
    try {
        // Simulate audio file upload
        const response = await axios.post('http://localhost:3000/api/upload-audio', {
            userId: 'testUserId',
            audioFile: 'base64-audio-data' // Replace with actual audio data
        });

        // Simulate OTP sending
        const otpResponse = await axios.post('http://localhost:3000/send-otp', {
            email: 'test@example.com' // Replace with actual email
        });
        const receivedOtp = otpResponse.data; // OTP is not returned in response body, adjust accordingly

        // Simulate OTP verification
        const otpVerificationResponse = await axios.post('http://localhost:3000/verify-otp', {
            otp: receivedOtp // Use the received OTP
        });
        console.log(response.data);
        console.log(otpVerificationResponse.data); // Log the verification response

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
};

testAudioUpload();
