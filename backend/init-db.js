const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDb() {
  try {
    console.log('Connecting to MySQL Database...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ...(process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {})
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
    await connection.query(`USE \`${process.env.DB_NAME}\`;`);

    console.log('Clearing old strict tables...');
    await connection.query(`SET FOREIGN_KEY_CHECKS = 0;`);
    await connection.query(`DROP TABLE IF EXISTS attendance, employees, users;`);
    await connection.query(`SET FOREIGN_KEY_CHECKS = 1;`);

    console.log('Creating demo-safe tables...');

    await connection.query(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'Employee',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    console.log('Users table created!');

    await connection.query(`
      CREATE TABLE employees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        employee_id VARCHAR(50) NULL DEFAULT NULL,
        name VARCHAR(255) NULL,
        email VARCHAR(255) NULL,
        mobile VARCHAR(20) DEFAULT NULL,
        department VARCHAR(100) DEFAULT 'Engineering',
        designation VARCHAR(100) DEFAULT 'Software Engineer Trainee',
        status VARCHAR(50) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);
    console.log('Employees table created!');

    await connection.query(`
      CREATE TABLE attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        date DATE NOT NULL,
        check_in DATETIME DEFAULT NULL,
        check_out DATETIME DEFAULT NULL,
        status VARCHAR(50) DEFAULT 'Present',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('Attendance table created!');

    await connection.end();
    console.log('DEMO-SAFE TABLES READY! You can now register without errors.');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization error:', error.message);
    process.exit(1);
  }
}

initDb();
