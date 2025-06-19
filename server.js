 const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const audioRoutes = require('./routes/audioRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

app.use(express.json());
app.use('/post', postRoutes);
app.use('/user', userRoutes);
app.use('/audio', audioRoutes);
app.use('/payment', paymentRoutes);

// Serve static files (frontend)
app.use(express.static(__dirname));

mongoose.connect('mongodb://localhost:27017/socialmedia', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });
