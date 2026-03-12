const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate, requireAdmin } = require('../middleware/auth');
const admin = require('../controllers/adminController');

// Multer config for file uploads
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 52428800 },
});

router.use(authenticate, requireAdmin);

// Challenges
router.get('/challenges', admin.getAllChallengesAdmin);
router.post('/challenges', admin.createChallenge);
router.patch('/challenges/:id', admin.updateChallenge);
router.delete('/challenges/:id', admin.deleteChallenge);

// Categories
router.get('/categories', admin.getCategories);
router.post('/categories', admin.createCategory);

// Teams
router.get('/teams', admin.getAllTeams);
router.post('/teams/:id/reset', admin.resetTeamScore);
router.delete('/teams/:id', admin.deleteTeam);

// Files
router.post('/upload', upload.single('file'), admin.uploadFile);

// Config
router.get('/config', admin.getConfig);
router.put('/config', admin.updateConfig);

module.exports = router;
