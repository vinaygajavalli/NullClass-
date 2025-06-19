const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const express = require('express');
const audioRoutes = require('../routes/audioRoutes');
const app = express();

app.use(express.json());
app.use('/api', audioRoutes);

describe('POST /api/request-otp', () => {
  it('should return 400 if email is missing', async () => {
    const res = await request(app).post('/api/request-otp').send({});
    expect(res.statusCode).to.equal(400);
    expect(res.body.message).to.equal('Email is required');
  });
});

// Additional tests for verify-otp and upload-audio can be added here
