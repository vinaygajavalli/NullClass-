const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
const request = require('supertest');
const express = require('express');
const User = require('../models/User');
const app = express();

app.use(express.json());

describe('POST /post/:userId', () => {
  let findByIdStub;

  before(() => {
    app.post('/post/:userId', async (req, res) => {
      try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({ message: 'User found' });
      } catch (err) {
        res.status(500).json({ message: 'Server error' });
      }
    });
  });

  beforeEach(() => {
    findByIdStub = sinon.stub(User, 'findById');
  });

  afterEach(() => {
    findByIdStub.restore();
  });

  it('should return 404 if user not found', async () => {
    findByIdStub.resolves(null);

    const res = await request(app).post('/post/invalidUserId');
    expect(res.statusCode).to.equal(404);
    expect(res.body).to.deep.include({ message: 'User not found' });
  });
});
