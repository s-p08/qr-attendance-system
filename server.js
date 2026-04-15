const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Logging the connection attempt for debugging
const MASKED_URI = process.env.MONGO_URI ? process.env.MONGO_URI.replace(/:([^@]+)@/, ':****@') : 'UNDEFINED';
console.log('Attempting to connect to MongoDB:', MASKED_URI);

const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const sessionRoutes = require('./routes/sessionRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

app.use('/', sessionRoutes);
app.use('/', attendanceRoutes);

// Root route
app.get('/api/health', (req, res) => {
  res.send('QR Attendance Backend API is running...');
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'frontend', 'dist')));
  
  app.use((req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API Loading... Please use the Frontend dev server.');
  });
}

// MongoDB Connection
if (!MONGO_URI) {
  console.error('FATAL: MONGO_URI is not defined in .env file!');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB Successfully!'))
  .catch((err) => {
    console.error('MongoDB Connection Error Details:');
    console.error(err);
  });

// Start server
app.listen(PORT, (err) => {
  if (err) {
    console.error('Server startup error:', err);
    return;
  }
  console.log(`Server is running on port ${PORT}`);
});
