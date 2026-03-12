const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

const registerSchema = z.object({
  name: z.string().min(2).max(32).regex(/^[a-zA-Z0-9_\- ]+$/, 'Team name can only contain letters, numbers, spaces, underscores and hyphens'),
  email: z.string().email(),
  password: z.string().min(8).max(64),
  country: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const generateToken = (teamId) => {
  return jwt.sign({ teamId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

exports.register = async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);

    const existing = await prisma.team.findFirst({
      where: { OR: [{ email: data.email }, { name: data.name }] },
    });

    if (existing) {
      if (existing.email === data.email) {
        return res.status(409).json({ error: 'Email already registered' });
      }
      return res.status(409).json({ error: 'Team name already taken' });
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const avatarSeed = Math.random().toString(36).substring(2, 10);

    const team = await prisma.team.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        country: data.country || null,
        avatarSeed,
        isAdmin: data.adminKey === process.env.ADMIN_SETUP_KEY,
      },
      select: { id: true, name: true, email: true, country: true, score: true, isAdmin: true, avatarSeed: true, createdAt: true },
    });

    const token = generateToken(team.id);

    res.status(201).json({ token, team });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);

    const team = await prisma.team.findUnique({ where: { email: data.email } });
    if (!team) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(data.password, team.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(team.id);

    res.json({
      token,
      team: {
        id: team.id,
        name: team.name,
        email: team.email,
        country: team.country,
        score: team.score,
        isAdmin: team.isAdmin,
        avatarSeed: team.avatarSeed,
        createdAt: team.createdAt,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const team = await prisma.team.findUnique({
      where: { id: req.team.id },
      select: {
        id: true, name: true, email: true, country: true,
        score: true, isAdmin: true, avatarSeed: true, createdAt: true,
        submissions: {
          where: { correct: true },
          include: { challenge: { select: { id: true, title: true, points: true, difficulty: true } } },
          orderBy: { submittedAt: 'desc' },
        },
      },
    });

    res.json(team);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

exports.refreshToken = async (req, res) => {
  const token = generateToken(req.team.id);
  res.json({ token });
};
