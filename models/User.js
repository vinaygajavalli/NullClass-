const mongoose = require("mongoose");

const loginRecordSchema = new mongoose.Schema({
    browser: String,
    os: String,
    device: String,
    ip: String,
    loginTime: Date
}, { _id: false });

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,  // Added password field
    followers: { type: Number, default: 0 },
    postsToday: { type: Number, default: 0 },
    lastPostTime: Date,
    loginHistory: [loginRecordSchema],
    otp: String,
    preferredLanguage: { type: String, default: "en" },
    subscriptionPlan: { type: String, default: "free" },
    tweetLimit: { type: Number, default: 1 }
});

module.exports = mongoose.model("User", userSchema);
