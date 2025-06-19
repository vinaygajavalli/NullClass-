  const express = require("express");
const User = require("../models/User");
const router = express.Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// In-memory OTP store for demo purposes
const otpStore = new Map();

// Configure nodemailer transporter (use your SMTP settings)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER || 'your-email@gmail.com',
        pass: process.env.GMAIL_PASS || 'your-email-password'
    }
});

// Signup route
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            console.log('Signup validation failed: missing fields');
            return res.status(400).json({ message: 'Username, email and password are required' });
        }
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('Signup failed: user already exists with email', email);
            return res.status(409).json({ message: 'User already exists' });
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create new user
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        console.log('User registered successfully:', newUser._id);
        res.status(201).json({ message: 'User registered successfully', userId: newUser._id });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Fetch user details
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Update user's preferred language
router.put("/user/:id/language", async (req, res) => {
    try {
        const { preferredLanguage } = req.body;
        if (!preferredLanguage) {
            return res.status(400).json({ message: "Preferred language is required" });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { preferredLanguage },
            { new: true }
        );

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ message: "Preferred language updated", preferredLanguage: user.preferredLanguage });
    } catch (err) { 
        res.status(500).json({ message: "Server error" });
    }
});

// Login tracking endpoint
router.post('/login', async (req, res) => {
    try {
        const { email, password, browser, os, deviceType, ipAddress } = req.body;
        console.log('Login request received:', req.body);
        if (!email || !password) {
            console.log('Email or password missing in request');
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found for email:', email);
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Add login info to user's login history
        const loginInfo = {
            dateTime: new Date(),
            browser,
            os,
            deviceType,
            ipAddress
        };

        user.loginHistory = user.loginHistory || [];
        user.loginHistory.push(loginInfo);
        await user.save();

        // Authentication logic based on browser and device
        if (browser && browser.toLowerCase().includes('chrome')) {
            // Send OTP email for Chrome
            const otp = crypto.randomInt(100000, 999999).toString();
            otpStore.set(user.email, otp);

            const mailOptions = {
                from: 'your-email@gmail.com',
                to: user.email,
                subject: 'Your Login OTP',
                text: `Your OTP for login is ${otp}. It is valid for 10 minutes.`
            };

            // Wrap sendMail in a Promise for async/await
            const sendMailAsync = () => {
                return new Promise((resolve, reject) => {
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            console.log('Error sending OTP email:', error);
                            reject(error);
                        } else {
                            console.log('OTP email sent:', info.response);
                            resolve(info);
                        }
                    });
                });
            };

            try {
                await sendMailAsync();
                setTimeout(() => otpStore.delete(user.email), 10 * 60 * 1000); // OTP expires in 10 minutes
                return res.json({ message: 'OTP sent to email for Chrome login' });
            } catch (error) {
                return res.status(500).json({ message: 'Failed to send OTP email' });
            }
        } else if (browser && browser.toLowerCase().includes('microsoft')) {
            // Allow login without authentication for Microsoft browser
            return res.json({ message: 'Login allowed without authentication for Microsoft browser' });
        } else if (deviceType && deviceType.toLowerCase() === 'mobile') {
            // Allow access only between 10 AM to 1 PM
            const now = new Date();
            const hours = now.getUTCHours() + 5; // IST
            const minutes = now.getUTCMinutes() + 30;
            const istHours = (minutes >= 60) ? hours + 1 : hours;

            if (istHours < 10 || istHours >= 13) {
                return res.status(403).json({ message: 'Mobile access allowed only between 10 AM and 1 PM IST' });
            }
            return res.json({ message: 'Mobile login allowed within time window' });
        } else {
            // Generate JWT token for authenticated user
            const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1h' });
            return res.json({ message: 'Login successful', token });
        }
    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
});

// Verify OTP endpoint for login
router.post('/verify-login-otp', (req, res) => {
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

router.get('/user/:id/login-history', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({ loginHistory: user.loginHistory || [] });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
