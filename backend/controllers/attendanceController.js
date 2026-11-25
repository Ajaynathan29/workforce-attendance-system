const db = require('../config/db');
const jwt = require('jsonwebtoken');

const getNowDateTime = () => {
  const now = new Date();
  const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  return istTime.toISOString().slice(0, 19).replace('T', ' ');
};

const getTodayDate = () => {
  const now = new Date();
  const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  return istTime.toISOString().split('T')[0];
};

const calculateDuration = (startVal, endVal) => {
  if (!startVal || !endVal) return null;
  const start = new Date(startVal);
  const end = new Date(endVal);
  const diffMs = end - start;
  if (isNaN(diffMs) || diffMs <= 0) return null;

  const totalMins = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  return `${hours} hrs ${mins} mins`;
};

const getUserId = (req) => {
  if (req.body && (req.body.user_id || req.body.userId || req.body.employee_id || req.body.id)) {
    return req.body.user_id || req.body.userId || req.body.employee_id || req.body.id;
  }
  if (req.user && (req.user.id || req.user.user_id)) {
    return req.user.id || req.user.user_id;
  }
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.decode(token);
      if (decoded) return decoded.id || decoded.user_id || decoded.sub;
    } catch (err) {}
  }
  return null;
};

const checkIn = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required to check in. Please log out and log back in.' });
    }

    const today = getTodayDate();
    const now = getNowDateTime();

    const [existing] = await db.execute(
      'SELECT * FROM attendance WHERE (user_id = ? OR employee_id = ?) AND (date = ? OR attendance_date = ?)',
      [userId, userId, today, today]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'You have already checked in for today!' });
    }

    await db.execute(
      'INSERT INTO attendance (user_id, employee_id, date, attendance_date, check_in, check_in_time, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, userId, today, today, now, now, 'Present']
    );

    return res.status(201).json({ message: 'Check-In recorded successfully!', time: now, date: today });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Server error during check-in: ' + error.message });
  }
};

const checkOut = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required to check out.' });
    }

    const today = getTodayDate();
    const now = getNowDateTime();

    const [existing] = await db.execute(
      'SELECT * FROM attendance WHERE (user_id = ? OR employee_id = ?) AND (date = ? OR attendance_date = ?)',
      [userId, userId, today, today]
    );

    if (existing.length === 0) {
      return res.status(400).json({ message: 'No check-in record found for today. Please Check In first!' });
    }

    const row = existing[0];
    if (row.check_out || row.check_out_time) {
      return res.status(400).json({ message: 'You have already checked out for today!' });
    }

    const checkInVal = row.check_in || row.check_in_time;
    const durationStr = calculateDuration(checkInVal, now) || '0 hrs 1 mins';

    await db.execute(
      'UPDATE attendance SET check_out = ?, check_out_time = ?, total_hours = ?, work_hours = ? WHERE id = ?',
      [now, now, durationStr, durationStr, row.id]
    );

    return res.status(200).json({ message: 'Check-Out recorded successfully!', time: now, totalHours: durationStr });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ message: 'Server error during check-out: ' + error.message });
  }
};

const markAttendance = async (req, res) => {
  const userId = getUserId(req);
  const today = getTodayDate();
  const [existing] = await db.execute(
    'SELECT * FROM attendance WHERE (user_id = ? OR employee_id = ?) AND (date = ? OR attendance_date = ?)',
    [userId, userId, today, today]
  );
  return existing.length === 0 ? checkIn(req, res) : checkOut(req, res);
};

const getAttendance = async (req, res) => {
  try {
    const userId = getUserId(req);
    let query = `
      SELECT a.*, u.name as full_name, u.email
      FROM attendance a
      LEFT JOIN users u ON a.user_id = u.id
    `;
    const params = [];
    if (userId) {
      query += ' WHERE a.user_id = ? OR a.employee_id = ?';
      params.push(userId, userId);
    }
    query += ' ORDER BY a.id DESC';

    const [records] = await db.execute(query, params);

    const enriched = records.map((row) => {
      const checkInTime = row.check_in || row.check_in_time;
      const checkOutTime = row.check_out || row.check_out_time;
      const duration = calculateDuration(checkInTime, checkOutTime) || row.total_hours || null;

      return {
        ...row,
        date: row.date || row.attendance_date,
        check_in: checkInTime,
        check_out: checkOutTime,
        total_hours: duration,
      };
    });

    res.status(200).json(enriched);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Server error while fetching attendance records: ' + error.message });
  }
};

const exportAttendance = async (req, res) => {
  try {
    const [records] = await db.execute(`
      SELECT u.name as full_name, u.email, a.date, a.check_in, a.check_out, a.total_hours, a.status
      FROM attendance a LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.id DESC
    `);

    let csv = 'Name,Email,Date,Check-In,Check-Out,Total Hours,Status\n';
    records.forEach((row) => {
      csv += `"${row.full_name || 'Employee'}","${row.email || ''}","${row.date || ''}","${row.check_in || ''}","${row.check_out || ''}","${row.total_hours || 'In Progress...'}","${row.status || 'Present'}"\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('attendance_report.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Error exporting report' });
  }
};

module.exports = { checkIn, checkOut, markAttendance, getAttendance, exportAttendance };
