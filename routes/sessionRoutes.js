const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Session = require('../models/Session');

// API 1: Create a new session with random token
router.post('/create-session', async (req, res) => {
  try {
    const { title, description } = req.body;
    
    // Generate a secure random token
    const token = crypto.randomBytes(16).toString('hex');

    const session = new Session({
      title,
      description,
      token,
    });

    const savedSession = await session.save();
    res.status(201).json({
      message: 'Session created successfully!',
      session: savedSession,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Helper: Get all active sessions
router.get('/sessions', async (req, res) => {
  try {
    const sessions = await Session.find({ isActive: true });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
