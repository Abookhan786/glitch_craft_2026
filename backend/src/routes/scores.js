const express = require('express');
const router = express.Router();
const { getScoreboard, getScoreHistory, getStats } = require('../controllers/scoreController');

router.get('/', getScoreboard);
router.get('/history', getScoreHistory);
router.get('/stats', getStats);

module.exports = router;
