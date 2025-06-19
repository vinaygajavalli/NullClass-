const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const express = require('express');
const userRoutes = require('../routes/userRoutes');
const app = express();

app.use(express.json());
app.use('/api', userRoutes);

describe('POST /api/login', () => {
  it('should return 400 if userId is missing', async () => {
    const res = await request(app).post('/api/login').send({});
    expect(res.statusCode).to.equal(400);
    expect(res.body.message).to.equal('User ID is required');
  });

  // Additional tests for login tracking and OTP can be added here
});
