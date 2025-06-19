document.addEventListener('DOMContentLoaded', () => {
  // Authentication related elements
  const emailInput = document.getElementById('email');
  const otpInputField = document.getElementById('otpInput');
  const loginButton = document.getElementById('loginButton');
  let verifyOtpButton;
  const loginStatus = document.getElementById('loginStatus');
  const accessGrantedMessage = document.getElementById('accessGrantedMessage');

  // Registration related elements
  const regUsernameInput = document.getElementById('regUsername');
  const regEmailInput = document.getElementById('regEmail');
  const registerButton = document.getElementById('registerButton');
  const registerStatus = document.getElementById('registerStatus');

  // Function to send OTP request to backend
  async function sendEmailOTP(email) {
    const response = await fetch('/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    if (!response.ok) {
      throw new Error(data.message || 'Failed to send OTP');
    }
    return data;
  }

  // Function to verify OTP with backend
  async function verifyEmailOTP(email, otp) {
    const response = await fetch('/user/verify-login-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    if (!response.ok) {
      throw new Error(data.message || 'OTP verification failed');
    }
    return data;
  }

  // Function to register new user
  async function registerUser(username, email) {
    const response = await fetch('/user/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email })
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    return data;
  }

  if (loginButton && emailInput) {
    loginButton.addEventListener('click', async () => {
      const email = emailInput.value.trim();
      if (!email) {
        alert('Please enter your email');
        return;
      }
      try {
        const data = await sendEmailOTP(email);
        verifyOtpButton = document.getElementById('verifyOtpButton');
        if (data.message === 'Login allowed without authentication for Microsoft browser') {
          // Remove OTP input and verify button from DOM
          if (otpInputField && otpInputField.parentNode) {
            otpInputField.parentNode.removeChild(otpInputField);
          }
          if (verifyOtpButton && verifyOtpButton.parentNode) {
            verifyOtpButton.parentNode.removeChild(verifyOtpButton);
          }
          if (loginStatus) loginStatus.style.display = 'none';
          if (accessGrantedMessage) accessGrantedMessage.style.display = 'block';
          alert('Login successful without OTP for Microsoft browser');
          // Store userId in localStorage (simulate fetching userId)
          localStorage.setItem('userId', 'dummyUserId'); // Replace with actual userId from backend if available
          // Redirect to main app page after successful login
          window.location.href = 'index.html';
        } else {
          // Show OTP input and verify button for other cases
          if (otpInputField) otpInputField.style.display = 'none';
          if (verifyOtpButton) verifyOtpButton.style.display = 'none';
          alert('OTP sent to your email');
        }
      } catch (error) {
        alert('Failed to send OTP: ' + error.message);
      }
    });
  }
  
  // Function to fetch and update profile details dynamically
  async function fetchAndUpdateProfile() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.log('User not logged in');
      return;
    }
    try {
      const response = await fetch(`/user/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      const user = await response.json();
      const profileSection = document.getElementById('profile-details');
      if (profileSection) {
        profileSection.innerHTML = `
          <h2>Profile Details</h2>
          <p>Name: ${user.username || 'N/A'}</p>
          <p>Email: ${user.email || 'N/A'}</p>
        `;
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }
  
  // Call fetchAndUpdateProfile on profile page load
  if (window.location.pathname.endsWith('profile.html')) {
    fetchAndUpdateProfile();
  }

  if (verifyOtpButton && emailInput && otpInputField) {
    verifyOtpButton.addEventListener('click', async () => {
      const email = emailInput.value.trim();
      const otp = otpInputField.value.trim();
      if (!email || !otp) {
        alert('Please enter both email and OTP');
        return;
      }
      try {
        await verifyEmailOTP(email, otp);
        alert('OTP verified successfully');
        accessGrantedMessage.style.display = 'block';
        // Redirect to main app page after successful login
        window.location.href = 'index.html';
      } catch (error) {
        alert('OTP verification failed: ' + error.message);
      }
    });
  }

  if (registerButton && regUsernameInput && regEmailInput) {
    registerButton.addEventListener('click', async () => {
      const username = regUsernameInput.value.trim();
      const email = regEmailInput.value.trim();
      registerStatus.textContent = '';
      if (!username || !email) {
        registerStatus.textContent = 'Please enter both username and email.';
        return;
      }
      try {
        const response = await fetch('/user/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email })
        });
        const errorText = await response.text();
        const errorData = errorText ? JSON.parse(errorText) : {};
        if (!response.ok) {
          throw new Error(errorData.message || 'Registration failed');
        }
        registerStatus.style.color = 'green';
        registerStatus.textContent = 'Registration successful. You can now login.';
        regUsernameInput.value = '';
        regEmailInput.value = '';
      } catch (error) {
        registerStatus.style.color = 'red';
        registerStatus.textContent = 'Registration failed: ' + error.message;
      }
    });
  }

  // Posting tweet logic with posting limits and notifications
  const postTweetButton = document.getElementById('postTweetButton');
  const tweetInput = document.getElementById('tweetInput');

  if (postTweetButton && tweetInput) {
    postTweetButton.addEventListener('click', async () => {
      const tweetText = tweetInput.value.trim();
      if (!tweetText) {
        alert('Please enter a tweet');
        return;
      }

      try {
        // Assuming userId is stored in localStorage after login
        const userId = localStorage.getItem('userId');
        if (!userId) {
          alert('User not logged in');
          return;
        }

        const response = await fetch(`/post/post/${userId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tweet: tweetText })
        });

        const data = await response.json();

        if (response.ok) {
          alert(data.message || 'Tweet posted successfully');
          tweetInput.value = '';

          // Show notification if tweet contains "cricket" or "science"
          if (window.Notification && Notification.permission === 'granted') {
            if (/cricket|science/i.test(tweetText)) {
              new Notification('New Tweet Notification', {
                body: tweetText
              });
            }
          } else if (window.Notification && Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
              if (permission === 'granted' && /cricket|science/i.test(tweetText)) {
                new Notification('New Tweet Notification', {
                  body: tweetText
                });
              }
            });
          }
        } else {
          alert(data.message || 'Failed to post tweet');
        }
      } catch (error) {
        alert('Error posting tweet: ' + error.message);
      }
    });
  }

  // Audio upload feature: enable upload button after OTP verification and show success message
  const requestOtpButton = document.getElementById('requestOtpButton');
  const otpInput = document.getElementById('otpInput');
  const uploadAudioButton = document.getElementById('uploadAudioButton');
  const uploadSuccessMessage = document.getElementById('uploadSuccessMessage');

  if (uploadAudioButton) {
    uploadAudioButton.disabled = true; // Initially disabled
  }

  if (requestOtpButton) {
    requestOtpButton.disabled = false; // Ensure request OTP button is enabled initially
    requestOtpButton.addEventListener('click', () => {
      // Enable OTP input and verify button on request
      if (otpInput) otpInput.disabled = false;
      if (verifyOtpButton) verifyOtpButton.disabled = false;
      // Enable request OTP button to allow multiple requests
      requestOtpButton.disabled = false;
    });
  }

  if (verifyOtpButton && uploadAudioButton && uploadSuccessMessage) {
    verifyOtpButton.addEventListener('click', async () => {
      const email = document.getElementById('email') ? document.getElementById('email').value.trim() : '';
      const otp = otpInput ? otpInput.value.trim() : '';
      if (!email || !otp) {
        alert('Please enter both email and OTP');
        return;
      }
      try {
        const response = await fetch('/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp })
        });
        const data = await response.json();
        if (response.ok) {
          uploadAudioButton.disabled = false;
          uploadSuccessMessage.style.display = 'none';
          alert(data.message || 'OTP verified successfully');
        } else {
          alert(data.message || 'OTP verification failed');
        }
      } catch (error) {
        alert('Error verifying OTP: ' + error.message);
      }
    });
  }

  if (uploadAudioButton && uploadSuccessMessage) {
    uploadAudioButton.addEventListener('click', async () => {
      const audioFileInput = document.getElementById('audioFileInput');
      if (!audioFileInput || !audioFileInput.files || audioFileInput.files.length === 0) {
        alert('Please select an audio file to upload');
        return;
      }
      const file = audioFileInput.files[0];
      const formData = new FormData();
      formData.append('audio', file);
      const email = document.getElementById('email') ? document.getElementById('email').value.trim() : '';
      formData.append('email', email);

      try {
        const response = await fetch('/upload-audio', {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        if (response.ok) {
          uploadSuccessMessage.style.display = 'block';
          uploadSuccessMessage.textContent = data.message || 'Audio uploaded successfully';
        } else {
          uploadSuccessMessage.style.display = 'block';
          uploadSuccessMessage.style.color = 'red';
          uploadSuccessMessage.textContent = data.message || 'Audio upload failed';
        }
      } catch (error) {
        uploadSuccessMessage.style.display = 'block';
        uploadSuccessMessage.style.color = 'red';
        uploadSuccessMessage.textContent = 'Error uploading audio: ' + error.message;
      }
    });
  }

  // Payment handling
  const payButton = document.querySelector('.pay-button');
  const paymentSuccessMessage = document.getElementById('paymentSuccessMessage');
  const paymentErrorMessage = document.getElementById('paymentErrorMessage');

  if (payButton && paymentSuccessMessage && paymentErrorMessage) {
    payButton.addEventListener('click', () => {
      // Simulate payment time window check (10 to 11 AM IST)
      const now = new Date();
      let hours = now.getUTCHours() + 5; // IST offset
      let minutes = now.getUTCMinutes() + 30;
      if (minutes >= 60) {
        minutes -= 60;
        hours += 1;
      }
      const istHours = hours;

      if (istHours >= 10 && istHours < 11) {
        // Payment allowed
        paymentSuccessMessage.style.display = 'block';
        paymentErrorMessage.style.display = 'none';
      } else {
        // Payment not allowed
        paymentSuccessMessage.style.display = 'none';
        paymentErrorMessage.style.display = 'block';
      }
    });

    // Expose functions for testing to show/hide messages
    window.showPaymentSuccess = () => {
      paymentSuccessMessage.style.display = 'block';
      paymentErrorMessage.style.display = 'none';
    };
    window.showPaymentError = () => {
      paymentSuccessMessage.style.display = 'none';
      paymentErrorMessage.style.display = 'block';
    };
  }
});
