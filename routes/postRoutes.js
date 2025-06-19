const express = require("express");
const User = require("../models/User");
const router = express.Router();

router.post("/post/:userId", async (req, res) => {
    try {
        console.log("Received post request for userId:", req.params.userId);
        const user = await User.findById(req.params.userId);
        console.log("User found:", user);
        if (!user) {
            console.log("User not found, sending 404");
            return res.status(404).json({ message: "User not found" });
        }

        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();

        // Restrict users with 0 followers to post only from 10:00-10:30 AM IST
        if (user.followers === 0 && (hours !== 10 || minutes > 30)) {
            console.log("User with 0 followers trying to post outside allowed time");
            return res.status(403).json({ message: "You can only post between 10:00 - 10:30 AM IST." });
        }

        // Users with 2+ followers can post 2 times a day
        if (user.followers >= 2 && user.postsToday >= 2) {
            console.log("User reached daily posting limit");
            return res.status(403).json({ message: "You have reached the daily posting limit." });
        }

        // Users with 10+ friends can post unlimited times
        if (user.friends < 10) {
            user.postsToday += 1;
        }

        user.lastPostTime = now;
        await user.save();

        console.log("Post successful");
        res.status(200).json({ message: "Tweet posted successfully!" });
    } catch (err) {
        console.error("Error in post route:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
