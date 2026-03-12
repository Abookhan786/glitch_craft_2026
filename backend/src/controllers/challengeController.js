const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

exports.getAllChallenges = async (req, res) => {
  try {
    const challenges = await prisma.challenge.findMany({
      where: { isActive: true },
      include: {
        category: true,
        files: { select: { id: true, name: true, url: true, size: true } },
        hints: { select: { id: true, cost: true } },
        _count: { select: { submissions: { where: { correct: true } } } },
      },
      orderBy: [{ category: { name: 'asc' } }, { points: 'asc' }],
    });

    // If authenticated, attach solve status per team
    const teamId = req.team?.id;
    let solvedIds = new Set();

    if (teamId) {
      const solved = await prisma.submission.findMany({
        where: { teamId, correct: true },
        select: { challengeId: true },
      });
      solvedIds = new Set(solved.map((s) => s.challengeId));
    }

    const result = challenges.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      difficulty: c.difficulty,
      points: c.points,
      category: c.category,
      files: c.files,
      hints: c.hints,
      solveCount: c._count.submissions,
      isSolved: solvedIds.has(c.id),
      isFeatured: c.isFeatured,
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
};

exports.getChallengeById = async (req, res) => {
  try {
    const { id } = req.params;
    const challenge = await prisma.challenge.findUnique({
      where: { id, isActive: true },
      include: {
        category: true,
        files: true,
        hints: { select: { id: true, cost: true, content: false } },
      },
    });

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Attach unlocked hints if authenticated
    let unlockedHintIds = new Set();
    if (req.team?.id) {
      const unlocks = await prisma.hintUnlock.findMany({
        where: { teamId: req.team.id, hint: { challengeId: id } },
        select: { hintId: true },
      });
      unlockedHintIds = new Set(unlocks.map((u) => u.hintId));
    }

    const hintsWithContent = await Promise.all(
      challenge.hints.map(async (h) => {
        const base = { id: h.id, cost: h.cost };
        if (unlockedHintIds.has(h.id)) {
          const full = await prisma.hint.findUnique({ where: { id: h.id } });
          return { ...base, content: full.content, unlocked: true };
        }
        return { ...base, unlocked: false };
      })
    );

    const solved = req.team?.id
      ? await prisma.submission.findFirst({ where: { teamId: req.team.id, challengeId: id, correct: true } })
      : null;

    res.json({
      ...challenge,
      hints: hintsWithContent,
      isSolved: !!solved,
      flag: undefined, // never expose flag
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch challenge' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { challenges: { where: { isActive: true } } } },
      },
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};
