const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const configs = await prisma.eventConfig.findMany();
    const result = {};
    configs.forEach((c) => (result[c.key] = c.value));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch config' });
  }
});

module.exports = router;
