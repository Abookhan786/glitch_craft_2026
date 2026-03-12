// hints.js
const express = require('express');
const router = express.Router();
const { unlockHint } = require('../controllers/hintController');
const { authenticate } = require('../middleware/auth');

router.post('/:hintId/unlock', authenticate, unlockHint);

module.exports = router;
