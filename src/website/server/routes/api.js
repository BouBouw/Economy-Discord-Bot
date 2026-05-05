const express = require('express');
const prisma = require('../../../../handlers/database');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

/** GET /api/profile/me — current user's profile */
router.get('/me', requireAuth, async (req, res) => {
    try {
        const profile = await prisma.profile.findFirst({
            where: { userId: req.userId },
            select: {
                userId: true,
                displayName: true,
                balance: true,
                inBank: true,
                level: true,
                experiences: true,
                reputations: true,
                backgroundUrl: true,
            },
        });

        if (!profile) return res.status(404).json({ error: 'Profile not found' });

        return res.json({
            ...profile,
            balance: parseFloat(profile.balance.toString()),
            inBank: parseFloat(profile.inBank.toString()),
        });
    } catch (err) {
        console.error('[API] /me error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

/** GET /api/profile/leaderboard — top 10 by balance */
router.get('/leaderboard', async (req, res) => {
    try {
        const profiles = await prisma.profile.findMany({
            orderBy: { balance: 'desc' },
            take: 10,
            select: {
                userId: true,
                displayName: true,
                balance: true,
                level: true,
            },
        });

        return res.json(
            profiles.map((p) => ({
                ...p,
                balance: parseFloat(p.balance.toString()),
            }))
        );
    } catch (err) {
        console.error('[API] /leaderboard error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
