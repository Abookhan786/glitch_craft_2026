require('dotenv').config();
const { execSync } = require('child_process');

// Run prisma db push on startup
try {
  console.log('Running database migrations...');
  execSync('./node_modules/.bin/prisma db push --accept-data-loss', { stdio: 'inherit' });
  console.log('Database ready!');
} catch (err) {
  console.error('Migration failed:', err.message);
}
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
const path = require('path');

const authRoutes = require('./routes/auth');
const challengeRoutes = require('./routes/challenges');
const submissionRoutes = require('./routes/submissions');
const scoreRoutes = require('./routes/scores');
const adminRoutes = require('./routes/admin');
const hintRoutes = require('./routes/hints');
const configRoutes = require('./routes/config');
const { initSocket } = require('./socket/scoreSocket');

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});
initSocket(io);

// Make io accessible in routes
app.set('io', io);

// Security middleware
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

const submitLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: 'Too many flag submissions, slow down.' },
});

app.use(limiter);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static file uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/submissions', submitLimiter, submissionRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/hints', hintRoutes);
app.use('/api/config', configRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'operational',
    event: 'GlitchCraft',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║       GlitchCraft CTF Platform        ║
  ║       Backend API v1.0.0              ║
  ╠═══════════════════════════════════════╣
  ║  Status  : ONLINE                     ║
  ║  Port    : ${PORT}                        ║
  ║  Mode    : ${process.env.NODE_ENV || 'development'}            ║
  ╚═══════════════════════════════════════╝
  `);
});

module.exports = { app, server };
