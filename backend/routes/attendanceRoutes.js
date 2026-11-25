const express = require('express');
const router = express.Router();
const { checkIn, checkOut, markAttendance, getAttendance, exportAttendance } = require('../controllers/attendanceController');

// Support all possible URL spellings from React
router.post('/check-in', checkIn);
router.post('/checkin', checkIn);
router.post('/check-out', checkOut);
router.post('/checkout', checkOut);
router.post('/mark', markAttendance);

router.get('/', getAttendance);
router.get('/history', getAttendance);
router.get('/export', exportAttendance);

module.exports = router;