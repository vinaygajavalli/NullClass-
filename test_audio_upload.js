const axios = require('axios');

const testAudioUpload = async () => {
    try {
        const response = await axios.post('http://localhost:3000/api/upload-audio', {
            userId: 'testUserId',
            audioFile: 'base64-audio-data' // Replace with actual audio data
        });

        console.log('Audio upload response:', response.data);
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

testAudioUpload();
