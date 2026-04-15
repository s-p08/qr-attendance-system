const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Session = require('../models/Session');
const crypto = require('crypto');

// API 2: Mark attendance with token and location validation
router.post('/mark-attendance', async (req, res) => {
  console.log('--- Incoming Attendance Request ---');
  console.log('From Student:', req.body.studentName);
  try {
    const { sessionId, token, studentId, studentName, location } = req.body;

    const CLASS_LAT = 29.9695;
    const CLASS_LNG = 76.8783;

    const getDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371e3;
      const phi1 = (lat1 * Math.PI) / 180;
      const phi2 = (lat2 * Math.PI) / 180;
      const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
      const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
      const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
                Math.cos(phi1) * Math.cos(phi2) *
                Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    if (!location || !location.lat || !location.lng) {
      console.log('--- ERROR: Location missing! ---');
      return res.status(400).json({ error: 'Location access is required!' });
    }

    const distance = getDistance(location.lat, location.lng, CLASS_LAT, CLASS_LNG);
    console.log(`--- Geofence Check: ---`);
    console.log(`Student Location: ${location.lat}, ${location.lng}`);
    console.log(`Target Location: ${CLASS_LAT}, ${CLASS_LNG}`);
    console.log(`Distance: ${(distance / 1000).toFixed(2)} km`);

    if (distance > 2000000) { // Increased to 2000km for easier testing
      console.log('--- ERROR: Too far! ---');
      return res.status(403).json({ error: `You are too far from the classroom! (${(distance/1000).toFixed(1)}km away)` });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      console.log('--- ERROR: Session not found! ---');
      return res.status(404).json({ error: 'Session not found!' });
    }
    if (!session.isActive) {
      console.log('--- ERROR: Session inactive! ---');
      return res.status(400).json({ error: 'This session has closed!' });
    }

    const calculateDynamicToken = (baseSecret, offset = 0) => {
      const windowIndex = Math.floor(Date.now() / 30000) + offset;
      return crypto.createHmac('sha256', baseSecret).update(windowIndex.toString()).digest('hex').slice(0, 16);
    };

    const tokenCurrent = calculateDynamicToken(session.token, 0);
    const tokenPrev = calculateDynamicToken(session.token, -1);
    
    console.log(`--- Token Check: ---`);
    console.log(`Received: ${token}`);
    console.log(`Expected (Current): ${tokenCurrent}`);
    console.log(`Expected (Previous): ${tokenPrev}`);

    if (token !== tokenCurrent && token !== tokenPrev) {
      console.log('--- ERROR: Token Mismatch! ---');
      return res.status(403).json({ error: 'EXPIRED QR: Please scan the updated QR code.' });
    }

    const existingEntry = await Attendance.findOne({ session: sessionId, studentId });
    if (existingEntry) return res.status(400).json({ error: 'Attendance already marked!' });

    const attendance = new Attendance({
      session: sessionId,
      studentId,
      studentName,
      location: { lat: location.lat, lng: location.lng }
    });

    await attendance.save();
    res.status(201).json({ message: 'Success' });

  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'Duplicate entry!' });
    res.status(400).json({ error: err.message });
  }
});

// API 3: Get all records for a session (INCLUDES TITLE FOR DASHBOARD)
router.get('/attendance/:sessionId', async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found!' });

    const records = await Attendance.find({ session: req.params.sessionId })
      .sort({ createdAt: -1 });
    
    res.json({ 
      count: records.length, 
      sessionTitle: session.title, // This was missing and caused the error
      records: records 
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
