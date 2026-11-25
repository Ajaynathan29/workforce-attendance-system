const express = require('express');
const router = express.Router();
// 1. Import registerUser alongside loginUser
const { loginUser, registerUser } = require('../controllers/authController');

router.post('/login', loginUser);
// 2. Add the missing registration route
router.post('/register', registerUser);

module.exports = router;