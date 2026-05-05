const express = require('express');
const jwt = require('jsonwebtoken');
const prisma = require('../../../../handlers/database');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'discord-activity-dev-secret';

/**
 * POST /api/auth/token
 * Discord Embedded App SDK token exchange flow:
 *  1. Client gets `code` via discordSdk.commands.authorize()
 *  2. POSTs it here
 *  3. Server exchanges with Discord API for access_token
 *  4. Returns a signed JWT for subsequent API / Socket.IO calls
 */
router.post('/token', async (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Missing code' });

    try {
        // Exchange code for Discord access token
        const tokenRes = await fetch('https://discord.com/api/v10/oauth2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.SECRET,
                grant_type: 'authorization_code',
                code,
            }),
        });

        const tokenData = await tokenRes.json();
        if (tokenData.error) {
            return res.status(400).json({ error: tokenData.error_description ?? tokenData.error });
        }

        // Fetch Discord user profile
        const userRes = await fetch('https://discord.com/api/v10/users/@me', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const user = await userRes.json();

        // Create profile if it doesn't exist yet
        const existing = await prisma.profile.findFirst({ where: { userId: user.id } });
        if (!existing) {
            await prisma.profile.create({
                data: {
                    userId: user.id,
                    displayName: user.global_name ?? user.username,
                    balance: 0,
                    inBank: 150,
                },
            });
        } else if (!existing.displayName) {
            // Back-fill display name if missing
            await prisma.profile.updateMany({
                where: { userId: user.id },
                data: { displayName: user.global_name ?? user.username },
            });
        }

        // Issue JWT (7 day expiry)
        const sessionToken = jwt.sign(
            { userId: user.id, accessToken: tokenData.access_token },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.json({ token: sessionToken });
    } catch (err) {
        console.error('[AUTH] Token exchange error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
