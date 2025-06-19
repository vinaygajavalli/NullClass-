const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const express = require('express');
const paymentRoutes = require('../routes/paymentRoutes');
const app = express();

app.use(express.json());
app.use('/api', paymentRoutes);

describe('POST /api/process-payment', () => {
  it('should return 403 if payment is outside allowed time', async () => {
    // Mock Date to outside 10-11 AM IST
    const realDate = Date;
    global.Date = class extends realDate {
      constructor() {
        super();
        return new realDate('2023-01-01T03:00:00Z'); // 8:30 AM IST (before 10 AM)
      }
    };

    const res = await request(app).post('/api/process-payment').send({
      email: 'test@example.com',
      plan: 'bronze',
      amount: 10000
    });

    expect(res.statusCode).to.equal(403);

    global.Date = realDate;
  });

  // Additional tests for successful payment can be added here
});
