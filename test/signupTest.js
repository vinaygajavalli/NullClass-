const fetch = require('node-fetch');

async function testSignup() {
  const url = 'http://localhost:3000/user/signup'; // Adjust port if needed
  const userData = {
    username: 'testuser',
    email: 'testuser@example.com',
    password: 'TestPassword123'
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    const data = await response.text(); // Read as text to see raw response
    console.log('Status:', response.status);
    console.log('Response body:', data);

    try {
      const json = JSON.parse(data);
      console.log('Parsed JSON:', json);
    } catch (err) {
      console.error('Failed to parse JSON:', err.message);
    }
  } catch (error) {
    console.error('Error during fetch:', error.message);
  }
}

testSignup();
