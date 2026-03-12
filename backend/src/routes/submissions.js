// submissions.js
const express = require('express');
const router = express.Router();
const { submitFlag, getTeamSubmissions } = require('../controllers/submissionController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, submitFlag);
router.get('/mine', authenticate, getTeamSubmissions);

module.exports = router;
