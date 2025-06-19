const mongoose = require('mongoose');
const User = require('./models/User');

const mongoURI = 'mongodb+srv://vinaygajavalli2003:Vinay%402003@cluster0.nxmer2l.mongodb.net/myappdb?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('Connected to MongoDB');

    const testUser = new User({
        username: 'testuser',
        email: 'testuser@example.com',
        followers: 0,
        postsToday: 0,
        loginHistory: []
    });

    await testUser.save();
    console.log('Test user inserted successfully');
    mongoose.disconnect();
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});
