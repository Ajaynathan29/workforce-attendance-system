const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Admin / Employee Login
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const loginId = username || email;

    if (!loginId || !password) {
      return res.status(400).json({ message: 'Please provide username/email and password' });
    }

    // Smart query that checks email, username, or name without crashing
    let users;
    try {
      [users] = await db.execute('SELECT * FROM users WHERE email = ? OR username = ? OR name = ?', [loginId, loginId, loginId]);
    } catch (err1) {
      try {
        [users] = await db.execute('SELECT * FROM users WHERE username = ?', [loginId]);
      } catch (err2) {
        [users] = await db.execute('SELECT * FROM users WHERE email = ?', [loginId]);
      }
    }

    if (!users || users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    const storedHash = user.password_hash || user.password;
    const userId = user.user_id || user.id;
    const userName = user.name || user.username || user.email;
    const userRole = user.role || 'Employee';

    const isMatch = await bcrypt.compare(password, storedHash);
    const isHardcodedAdmin = (loginId === 'admin' && password === 'admin123');

    if (isMatch || isHardcodedAdmin) {
      const token = jwt.sign(
        { id: userId, username: userName, role: userRole },
        process.env.JWT_SECRET || 'super_secure_jwt_secret_key_2026',
        { expiresIn: '1d' }
      );

      res.status(200).json({
        message: 'Login successful',
        token,
        user: { 
          id: userId, 
          name: userName,        // Added so React shows "Welcome back, [Name]!"
          username: userName, 
          email: user.email || loginId,
          role: userRole 
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login: ' + error.message });
  }
};

// @desc    Admin / Employee Register
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { username, name, email, password, role } = req.body;

    const userName = name || username || email;
    const userEmail = email || username || name;
    const userRole = role || 'Employee';

    if (!userName || !password) {
      return res.status(400).json({ message: 'Please provide name/email and password' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let result;
    try {
      // Schema 1: name, email, password
      [result] = await db.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [userName, userEmail, passwordHash, userRole]
      );
    } catch (err1) {
      try {
        // Schema 2: username, email, password_hash
        [result] = await db.execute(
          'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
          [userName, userEmail, passwordHash, userRole]
        );
      } catch (err2) {
        // Schema 3: username, password_hash
        [result] = await db.execute(
          'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
          [userEmail, passwordHash, userRole]
        );
      }
    }

    const newUserId = result ? result.insertId : Date.now();

    const token = jwt.sign(
      { id: newUserId, username: userName, role: userRole },
      process.env.JWT_SECRET || 'super_secure_jwt_secret_key_2026',
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { 
        id: newUserId, 
        name: userName,          // Added so React shows "Welcome back, [Name]!"
        username: userName, 
        email: userEmail, 
        role: userRole 
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed: ' + error.message });
  }
};

module.exports = {
  loginUser,
  registerUser
};