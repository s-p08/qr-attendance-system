const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  token: { type: String, unique: true, required: true }, // The unique identifier generated for the session
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Session', SessionSchema);
