const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.getScoreboard = async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      where: { isAdmin: false },
      select: {
        id: true,
        name: true,
        score: true,
        country: true,
        avatarSeed: true,
        createdAt: true,
        submissions: {
          where: { correct: true },
          select: { submittedAt: true, points: true, challenge: { select: { title: true, difficulty: true } } },
          orderBy: { submittedAt: 'asc' },
        },
      },
      orderBy: [{ score: 'desc' }, { name: 'asc' }],
    });

    const result = teams.map((t, i) => ({
      rank: i + 1,
      id: t.id,
      name: t.name,
      score: t.score,
      country: t.country,
      avatarSeed: t.avatarSeed,
      solveCount: t.submissions.length,
      lastSolve: t.submissions.length > 0 ? t.submissions[t.submissions.length - 1].submittedAt : null,
      history: t.submissions.map((s) => ({ time: s.submittedAt, points: s.points, challenge: s.challenge.title })),
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch scoreboard' });
  }
};

exports.getScoreHistory = async (req, res) => {
  try {
    // Returns time-series score data for chart rendering
    const submissions = await prisma.submission.findMany({
      where: { correct: true },
      include: {
        team: { select: { id: true, name: true } },
        challenge: { select: { points: true } },
      },
      orderBy: { submittedAt: 'asc' },
    });

    // Build cumulative scores per team
    const teamScores = {};
    submissions.forEach((sub) => {
      const { team, challenge, submittedAt } = sub;
      if (!teamScores[team.id]) {
        teamScores[team.id] = { name: team.name, points: [{ time: submittedAt, score: 0 }] };
      }
      const lastScore = teamScores[team.id].points.slice(-1)[0].score;
      teamScores[team.id].points.push({
        time: submittedAt,
        score: lastScore + challenge.points,
      });
    });

    res.json(Object.values(teamScores));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch score history' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [teamCount, solveCount, challengeCount, topChallenge] = await Promise.all([
      prisma.team.count({ where: { isAdmin: false } }),
      prisma.submission.count({ where: { correct: true } }),
      prisma.challenge.count({ where: { isActive: true } }),
      prisma.challenge.findFirst({
        where: { isActive: true },
        orderBy: { solveCount: 'desc' },
        select: { title: true, solveCount: true },
      }),
    ]);

    res.json({ teamCount, solveCount, challengeCount, topChallenge });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};
