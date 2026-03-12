const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.submitFlag = async (req, res) => {
  try {
    const { challengeId, flag } = req.body;
    const teamId = req.team.id;

    if (!challengeId || !flag) {
      return res.status(400).json({ error: 'Challenge ID and flag are required' });
    }

    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId, isActive: true },
    });

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Check if already solved
    const alreadySolved = await prisma.submission.findFirst({
      where: { teamId, challengeId, correct: true },
    });

    if (alreadySolved) {
      return res.status(400).json({ error: 'Already solved this challenge', alreadySolved: true });
    }

    // Check flag (case-sensitive, trim whitespace)
    const correct = flag.trim() === challenge.flag.trim();

    // Record submission
    await prisma.submission.create({
      data: { teamId, challengeId, flag: flag.trim(), correct, points: correct ? challenge.points : 0 },
    });

    if (correct) {
      // Update team score
      const updatedTeam = await prisma.team.update({
        where: { id: teamId },
        data: { score: { increment: challenge.points } },
        select: { id: true, name: true, score: true },
      });

      // Update challenge solve count
      await prisma.challenge.update({
        where: { id: challengeId },
        data: { solveCount: { increment: 1 } },
      });

      // Emit real-time score update
      const io = req.app.get('io');
      if (io) {
        io.emit('score:update', {
          teamId: updatedTeam.id,
          teamName: updatedTeam.name,
          newScore: updatedTeam.score,
          challenge: { id: challenge.id, title: challenge.title, points: challenge.points },
        });

        // Emit full scoreboard update
        const scores = await getScoreboard();
        io.emit('scoreboard:update', scores);
      }

      return res.json({
        correct: true,
        message: `Correct! +${challenge.points} points`,
        points: challenge.points,
        newScore: updatedTeam.score,
      });
    }

    res.json({ correct: false, message: 'Incorrect flag. Keep trying!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Submission failed' });
  }
};

exports.getTeamSubmissions = async (req, res) => {
  try {
    const submissions = await prisma.submission.findMany({
      where: { teamId: req.team.id },
      include: { challenge: { select: { id: true, title: true, points: true, difficulty: true } } },
      orderBy: { submittedAt: 'desc' },
    });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
};

async function getScoreboard() {
  return prisma.team.findMany({
    where: { isAdmin: false },
    select: {
      id: true, name: true, score: true, country: true, avatarSeed: true,
      submissions: { where: { correct: true }, select: { submittedAt: true }, orderBy: { submittedAt: 'desc' }, take: 1 },
    },
    orderBy: [{ score: 'desc' }, { name: 'asc' }],
  });
}
