const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const path = require('path');
const useragent = require('useragent');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

// MongoDB connection setup
const mongoURI = 'mongodb+srv://vinaygajavalli2003:Vinay%402003@cluster0.nxmer2l.mongodb.net/myappdb?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
    console.log('Mongoose connection readyState:', mongoose.connection.readyState);
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

app.use(express.static(__dirname)); // Serve static files from root directory
// Logging middleware to trace incoming requests
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});

app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});

app.use(bodyParser.json());

// Serve index.html at root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const User = require('./models/User');

const moment = require('moment-timezone');

// Endpoint to send OTP
app.post('/send-otp', async (req, res) => {
    const email = req.body.email;
    if (!email) {
        return res.status(400).send('Email is required');
    }

    try {
        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Find user by email
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Save OTP to user document
        user.otp = otp;
        await user.save();

        // Configure nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'vinaygupta4620@gmail.com',
                pass: 'mhaa mvnw bfdr tttq'
            }
        });

        const mailOptions = {
            from: 'vinaygupta4620@gmail.com',
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is ${otp}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending OTP email:', error);
                return res.status(500).send('Error sending OTP: ' + error.message);
            }
            console.log('OTP email sent:', info.response);
            res.status(200).send('OTP sent successfully');
        });
    } catch (error) {
        console.error('Error in /send-otp:', error);
        res.status(500).send('Internal server error');
    }
});

// Endpoint to verify OTP
app.post('/verify-otp', async (req, res) => {
    const { email, otp: userOtp } = req.body;
    if (!email || !userOtp) {
        return res.status(400).send('Email and OTP are required');
    }

    try {
        // Find user by email
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Check OTP
        if (user.otp === userOtp) {
            // Clear OTP after successful verification and mark otpVerified true
            user.otp = null;
            user.otpVerified = true;
            await user.save();
            res.status(200).send('OTP verified successfully');
        } else {
            res.status(400).send('Invalid OTP');
        }
    } catch (error) {
        console.error('Error in /verify-otp:', error);
        res.status(500).send('Internal server error');
    }
});

// New endpoint to handle user login with tracking
app.post('/login', async (req, res) => {
    console.log('Login route handler started');
    console.log('Received /login request with headers:', req.headers);
    console.log('Request body:', req.body);

    const { username, email } = req.body;
    if (!username && !email) {
        return res.status(400).json({ message: 'Username or email is required for login' });
    }

    try {
        console.log('Parsing user-agent');
        const agent = useragent.parse(req.headers['user-agent']);
        const browser = agent.toAgent();
        const os = agent.os.toString();
        // Enhanced device type detection
        let deviceType = 'unknown';
        const deviceFamily = agent.device.family.toLowerCase();
        if (deviceFamily.includes('mobile') || deviceFamily.includes('phone')) {
            deviceType = 'mobile';
        } else if (deviceFamily.includes('tablet')) {
            deviceType = 'tablet';
        } else if (deviceFamily === 'other' || deviceFamily === '') {
            deviceType = 'desktop';
        } else {
            deviceType = deviceFamily;
        }
        const device = deviceType;
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const loginTime = new Date();

        console.log('Determining conditional access rules');
        // Conditional access rules
        if (browser.toLowerCase().includes('chrome')) {
            console.log('Chrome browser detected');
            // Require OTP verification for Chrome users
            const loginRecord = {
                browser,
                os,
                device,
                ip,
                loginTime,
                otpVerified: false
            };

            // Find user by username or email with timeout
            console.log('Querying User collection with:', { username, email });
            const user = await User.findOne({
                $or: [{ username: username || null }, { email: email || null }]
            }).maxTimeMS(5000);
            console.log('User query completed:', user);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Append login record to loginHistory
            user.loginHistory = user.loginHistory || [];
            user.loginHistory.push(loginRecord);

            await user.save();

            console.log('User login info saved (OTP required):', loginRecord);

            return res.status(200).json({
                message: 'OTP verification required',
                loginInfo: loginRecord
            });
        } else if (browser.toLowerCase().includes('edge')) {
            console.log('Edge browser detected');
            // Allow login immediately for Edge users
            const loginRecord = {
                browser,
                os,
                device,
                ip,
                loginTime,
                otpVerified: true
            };

            // Find user by username or email with timeout
            const user = await User.findOne({
                $or: [{ username: username || null }, { email: email || null }]
            }).maxTimeMS(5000);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Append login record to loginHistory
            user.loginHistory = user.loginHistory || [];
            user.loginHistory.push(loginRecord);

            await user.save();

            console.log('User login info saved (Edge, no OTP):', loginRecord);

            return res.status(200).json({
                message: 'Login successful',
                loginInfo: loginRecord
            });
        } else if (device === 'mobile') {
            console.log('Mobile device detected');
            // Check time window for mobile devices (10:00 AM to 1:00 PM IST)
            const nowIST = moment().tz('Asia/Kolkata');
            const startTime = moment.tz('10:00', 'HH:mm', 'Asia/Kolkata');
            const endTime = moment.tz('13:00', 'HH:mm', 'Asia/Kolkata');

            if (nowIST.isBefore(startTime) || nowIST.isAfter(endTime)) {
                return res.status(403).json({
                    message: 'Access denied: Mobile login allowed only between 10:00 AM and 1:00 PM IST'
                });
            }

            // Allow login within time window
            const loginRecord = {
                browser,
                os,
                device,
                ip,
                loginTime,
                otpVerified: true
            };

            // Find user by username or email with timeout
            const user = await User.findOne({
                $or: [{ username: username || null }, { email: email || null }]
            }).maxTimeMS(5000);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Append login record to loginHistory
            user.loginHistory = user.loginHistory || [];
            user.loginHistory.push(loginRecord);

            await user.save();

            console.log('User login info saved (Mobile, time restricted):', loginRecord);

            return res.status(200).json({
                message: 'Login successful',
                loginInfo: loginRecord
            });
        } else {
            console.log('Default login case');
            // Default allow login for other cases
            const loginRecord = {
                browser,
                os,
                device,
                ip,
                loginTime,
                otpVerified: true
            };

            // Find user by username or email with timeout
            const user = await User.findOne({
                $or: [{ username: username || null }, { email: email || null }]
            }).maxTimeMS(5000);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Append login record to loginHistory
            user.loginHistory = user.loginHistory || [];
            user.loginHistory.push(loginRecord);

            await user.save();

            console.log('User login info saved (default):', loginRecord);

            return res.status(200).json({
                message: 'Login successful',
                loginInfo: loginRecord
            });
        }
    } catch (error) {
        console.error('Error during login:', error);
        console.error('Mongoose connection readyState:', mongoose.connection.readyState);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// New endpoint to handle audio upload
app.post('/api/upload-audio', (req, res) => {
    // For now, just respond with success as a placeholder
    res.status(200).send('Audio uploaded successfully');
});

// Endpoint to handle payment success and send invoice email
app.post('/payment-success', (req, res) => {
    const { email, plan, paymentId, amount } = req.body;

    if (!email || !plan || !paymentId || !amount) {
        return res.status(400).json({ message: 'Missing required payment details' });
    }

    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'vinaygupta4620@gmail.com',
            pass: 'mhaa mvnw bfdr tttq'
        }
    });

    // Compose invoice email content
    const mailOptions = {
        from: 'vinaygupta4620@gmail.com',
        to: email,
        subject: 'Your Payment Invoice',
        html: `
            <h3>Thank you for your payment!</h3>
            <p>Your subscription plan: <strong>${plan.charAt(0).toUpperCase() + plan.slice(1)}</strong></p>
            <p>Payment ID: ${paymentId}</p>
            <p>Amount Paid: ₹${(amount / 100).toFixed(2)}</p>
            <p>If you have any questions, please contact support.</p>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending invoice email:', error);
            return res.status(500).json({ message: 'Failed to send invoice email' });
        }
        console.log('Invoice email sent:', info.response);
        res.status(200).json({ message: 'Invoice email sent successfully' });
    });
});

// Razorpay webhook endpoint for secure payment confirmation
app.post('/razorpay-webhook', (req, res) => {
    const webhookSecret = 'mhaa mvnw bfdr tttq'; // Your Razorpay webhook secret (replace with actual secret)

    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

    const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');

    if (signature !== expectedSignature) {
        console.error('Invalid webhook signature');
        return res.status(400).send('Invalid signature');
    }

    const event = req.body.event;

    if (event === 'payment.captured') {
        const paymentEntity = req.body.payload.payment.entity;
        const email = paymentEntity.email;
        const paymentId = paymentEntity.id;
        const amount = paymentEntity.amount;
        const plan = paymentEntity.notes ? paymentEntity.notes.plan : 'Unknown';

        // Configure nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'vinaygupta4620@gmail.com',
                pass: 'mhaa mvnw bfdr tttq'
            }
        });

        // Compose invoice email content
        const mailOptions = {
            from: 'vinaygupta4620@gmail.com',
            to: email,
            subject: 'Your Payment Invoice',
            html: `
                <h3>Thank you for your payment!</h3>
                <p>Your subscription plan: <strong>${plan.charAt(0).toUpperCase() + plan.slice(1)}</strong></p>
                <p>Payment ID: ${paymentId}</p>
                <p>Amount Paid: ₹${(amount / 100).toFixed(2)}</p>
                <p>If you have any questions, please contact support.</p>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending invoice email:', error);
                return res.status(500).json({ message: 'Failed to send invoice email' });
            }
            res.status(200).json({ message: 'Invoice email sent successfully' });
        });
    } else {
        res.status(200).json({ message: 'Event ignored' });
    }
});

app.get('/test', (req, res) => {
    res.status(200).send('Test route is working');
});

app.get('/user/login-history', async (req, res) => {
    console.log('Received request for /user/login-history');
    const email = req.query.email;
    if (!email) {
        console.log('Missing email query parameter');
        return res.status(400).json({ message: 'Email query parameter is required' });
    }

    try {
        console.log(`Looking up user with email: ${email}`);
        const user = await User.findOne({ email: email });
        if (!user) {
            console.log('User not found');
            return res.status(404).json({ message: 'User not found' });
        }

        // Return login history sorted by loginTime descending
        const sortedHistory = (user.loginHistory || []).sort((a, b) => new Date(b.loginTime) - new Date(a.loginTime));
        console.log(`Returning login history with ${sortedHistory.length} records`);
        res.json(sortedHistory);
    } catch (error) {
        console.error('Error fetching login history:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Catch-all 404 middleware for unmatched routes
app.use((req, res, next) => {
    res.status(404).json({ message: "Resource not found" });
});

// Error-handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

const listEndpoints = require('express-list-endpoints');

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    const endpoints = listEndpoints(app);
    console.log('Defined routes:');
    endpoints.forEach((endpoint) => {
        console.log(`${endpoint.methods.join(', ')} ${endpoint.path}`);
    });
});
