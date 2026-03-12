const express = require('express');
const router = express.Router();
const { getAllChallenges, getChallengeById, getCategories } = require('../controllers/challengeController');
const { authenticate } = require('../middleware/auth');

// Optional auth - provides solve status if logged in
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const jwt = require('jsonwebtoken');
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.team = { id: decoded.teamId };
    } catch {}
  }
  next();
};

router.get('/', optionalAuth, getAllChallenges);
router.get('/categories', getCategories);
router.get('/:id', optionalAuth, getChallengeById);

module.exports = router;
