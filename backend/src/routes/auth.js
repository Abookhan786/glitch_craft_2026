// routes/auth.js
const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/register', auth.register);
router.post('/login', auth.login);
router.get('/profile', authenticate, auth.getProfile);
router.post('/refresh', authenticate, auth.refreshToken);

module.exports = router;
