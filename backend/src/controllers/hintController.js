const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.unlockHint = async (req, res) => {
  try {
    const { hintId } = req.params;
    const teamId = req.team.id;

    const hint = await prisma.hint.findUnique({
      where: { id: hintId },
      include: { challenge: true },
    });

    if (!hint) return res.status(404).json({ error: 'Hint not found' });

    // Check already unlocked
    const existing = await prisma.hintUnlock.findUnique({
      where: { teamId_hintId: { teamId, hintId } },
    });

    if (existing) {
      return res.json({ content: hint.content, alreadyUnlocked: true });
    }

    // Deduct points if hint has a cost
    if (hint.cost > 0) {
      const team = await prisma.team.findUnique({ where: { id: teamId } });
      if (team.score < hint.cost) {
        return res.status(400).json({ error: 'Not enough points to unlock this hint' });
      }
      await prisma.team.update({ where: { id: teamId }, data: { score: { decrement: hint.cost } } });
    }

    await prisma.hintUnlock.create({ data: { teamId, hintId } });

    res.json({ content: hint.content, cost: hint.cost, unlocked: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to unlock hint' });
  }
};
