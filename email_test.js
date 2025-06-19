const nodemailer = require('nodemailer');

async function testEmail() {
  // Configure transporter with environment variables
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER || 'your-email@gmail.com',
      pass: process.env.GMAIL_PASS || 'your-email-password'
    }
  });

  const mailOptions = {
    from: process.env.GMAIL_USER || 'your-email@gmail.com',
    to: process.env.GMAIL_USER || 'your-email@gmail.com',
    subject: 'Test Email from Nodemailer',
    text: 'This is a test email to verify SMTP configuration.'
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Test email sent:', info.response);
  } catch (error) {
    console.error('Error sending test email:', error);
  }
}

testEmail();
