const db = require('../config/db');

const getDashboardStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [empStats] = await db.execute(`
      SELECT 
        COUNT(*) as totalEmployees,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as activeEmployees
      FROM employees
    `);

    const [attStats] = await db.execute(`
      SELECT COUNT(*) as presentToday 
      FROM attendance 
      WHERE attendance_date = ? AND status = 'Present'
    `, [today]);

    const totalActive = empStats[0].activeEmployees || 0;
    const presentToday = attStats[0].presentToday || 0;
    const absentToday = totalActive > presentToday ? totalActive - presentToday : 0;

    const [deptStats] = await db.execute(`
      SELECT department, COUNT(*) as count 
      FROM employees 
      WHERE status = 'Active' 
      GROUP BY department
    `);

    res.status(200).json({
      totalEmployees: empStats[0].totalEmployees || 0,
      activeEmployees: totalActive,
      presentToday,
      absentToday,
      departmentStats: deptStats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard statistics' });
  }
};

module.exports = { getDashboardStats };