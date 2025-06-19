const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Configure nodemailer transporter (use your SMTP settings)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password'
    }
});

// Payment processing endpoint with time restriction
router.post('/process-payment', (req, res) => {
    try {
        const now = new Date();
        let hours = now.getUTCHours() + 5; // Convert UTC to IST (UTC+5:30)
        let minutes = now.getUTCMinutes() + 30;
        if (minutes >= 60) {
            hours += 1;
            minutes -= 60;
        }
        const istHours = hours;

        if (istHours < 10 || istHours >= 11) {
            return res.status(403).json({ message: 'Payments are allowed only between 10 AM and 11 AM IST.' });
        }

        const { email, plan, amount } = req.body;
        if (!email || !plan || !amount) {
            return res.status(400).json({ message: 'Email, plan, and amount are required.' });
        }

        // TODO: Integrate with payment gateway (Razorpay, Stripe, etc.)
        // For demo, assume payment is successful

        // Send email invoice
        const mailOptions = {
            from: 'your-email@gmail.com',
            to: email,
            subject: 'Payment Invoice',
            text: `Thank you for your payment.\n\nPlan: ${plan}\nAmount: ₹${amount / 100}\n\nYour subscription is now active.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ message: 'Failed to send invoice email.' });
            }
            res.json({ message: 'Payment processed and invoice sent successfully.' });
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
