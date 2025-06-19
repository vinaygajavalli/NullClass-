const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const router = express.Router();

const upload = multer({
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('audio/')) {
            return cb(new Error('Only audio files are allowed'));
        }
        cb(null, true);
    }
});

// In-memory store for OTPs (for demo purposes, use DB in production)
const otpStore = new Map();

// Configure nodemailer transporter (use your SMTP settings)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password'
    }
});

// Request OTP endpoint
router.post('/request-otp', (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }
    const otp = crypto.randomInt(100000, 999999).toString();
    otpStore.set(email, otp);

    const mailOptions = {
        from: 'your-email@gmail.com',
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}. It is valid for 10 minutes.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).json({ message: 'Failed to send OTP email' });
        }
        setTimeout(() => otpStore.delete(email), 10 * 60 * 1000); // OTP expires in 10 minutes
        res.json({ message: 'OTP sent successfully' });
    });
});

// Verify OTP endpoint
router.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required' });
    }
    const storedOtp = otpStore.get(email);
    if (storedOtp !== otp) {
        return res.status(400).json({ message: 'Invalid OTP' });
    }
    otpStore.delete(email);
    res.json({ message: 'OTP verified successfully' });
});

const moment = require('moment-timezone');

// Audio upload endpoint
router.post('/upload-audio', upload.single('audio'), (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }
    if (!req.file) {
        return res.status(400).json({ message: 'Audio file is required' });
    }

    // Check if current time is between 2pm and 7pm IST
    const now = moment().tz('Asia/Kolkata');
    const start = moment.tz('14:00', 'HH:mm', 'Asia/Kolkata');
    const end = moment.tz('19:00', 'HH:mm', 'Asia/Kolkata');

    if (!now.isBetween(start, end)) {
        return res.status(403).json({ message: 'Audio upload allowed only between 2pm to 7pm IST' });
    }

    // TODO: Save audio file to storage (disk, cloud, etc.)
    // For demo, just respond success

    res.json({ message: 'Audio uploaded successfully' });
});

module.exports = router;
