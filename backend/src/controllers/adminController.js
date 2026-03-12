const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

const challengeSchema = z.object({
  title: z.string().min(1).max(128),
  description: z.string().min(1),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'INSANE']),
  points: z.number().int().min(1).max(10000),
  flag: z.string().min(1),
  categoryId: z.string(),
  isActive: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
  hints: z.array(z.object({ content: z.string(), cost: z.number().int().min(0) })).optional().default([]),
});

const categorySchema = z.object({
  name: z.string().min(1).max(64),
  slug: z.string().min(1).max(64),
  icon: z.string(),
  color: z.string(),
});

// ── Challenges ──────────────────────────────────────────────
exports.createChallenge = async (req, res) => {
  try {
    const data = challengeSchema.parse(req.body);
    const { hints, ...challengeData } = data;

    const challenge = await prisma.challenge.create({
      data: {
        ...challengeData,
        hints: { create: hints },
      },
      include: { category: true, hints: true },
    });

    res.status(201).json(challenge);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message });
    res.status(500).json({ error: 'Failed to create challenge' });
  }
};

exports.updateChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const data = challengeSchema.partial().parse(req.body);
    const { hints, ...challengeData } = data;

    const challenge = await prisma.challenge.update({
      where: { id },
      data: challengeData,
      include: { category: true, hints: true },
    });

    res.json(challenge);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message });
    res.status(500).json({ error: 'Failed to update challenge' });
  }
};

exports.deleteChallenge = async (req, res) => {
  try {
    await prisma.challenge.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete challenge' });
  }
};

exports.getAllChallengesAdmin = async (req, res) => {
  try {
    const challenges = await prisma.challenge.findMany({
      include: {
        category: true,
        hints: true,
        files: true,
        _count: { select: { submissions: { where: { correct: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(challenges);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
};

// ── Categories ───────────────────────────────────────────────
exports.createCategory = async (req, res) => {
  try {
    const data = categorySchema.parse(req.body);
    const category = await prisma.category.create({ data });
    res.status(201).json(category);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message });
    res.status(500).json({ error: 'Failed to create category' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { challenges: true } } },
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// ── Teams ─────────────────────────────────────────────────────
exports.getAllTeams = async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      select: {
        id: true, name: true, email: true, score: true, country: true,
        isAdmin: true, createdAt: true,
        _count: { select: { submissions: { where: { correct: true } } } },
      },
      orderBy: { score: 'desc' },
    });
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
};

exports.resetTeamScore = async (req, res) => {
  try {
    await prisma.$transaction([
      prisma.team.update({ where: { id: req.params.id }, data: { score: 0 } }),
      prisma.submission.deleteMany({ where: { teamId: req.params.id } }),
    ]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset team' });
  }
};

exports.deleteTeam = async (req, res) => {
  try {
    await prisma.team.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete team' });
  }
};

// ── File Upload ───────────────────────────────────────────────
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const { challengeId } = req.body;

    const file = await prisma.file.create({
      data: {
        name: req.file.originalname,
        url: `/uploads/${req.file.filename}`,
        size: req.file.size,
        challengeId,
      },
    });

    res.json(file);
  } catch (err) {
    res.status(500).json({ error: 'File upload failed' });
  }
};

// ── Event Config ──────────────────────────────────────────────
exports.updateConfig = async (req, res) => {
  try {
    const { key, value } = req.body;
    const config = await prisma.eventConfig.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update config' });
  }
};

exports.getConfig = async (req, res) => {
  try {
    const configs = await prisma.eventConfig.findMany();
    const result = {};
    configs.forEach((c) => (result[c.key] = c.value));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch config' });
  }
};
