const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true }, // NEW: Proper Name Field
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  status: { type: String, default: 'Present' },
}, { timestamps: true });

// Prevent duplicate attendance for the same student in the same session
AttendanceSchema.index({ session: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
