const jwt = require('jsonwebtoken');
const prisma = require('../../../../handlers/database');
const botEvents = require('../events');

const JWT_SECRET = process.env.JWT_SECRET || 'discord-activity-dev-secret';

// channelId → Set<userId>
const activeSessions = new Map();

/**
 * Sets up Socket.IO for the Discord Activity.
 * Namespace: /activity
 */
module.exports = function setupSocket(io, discordClient) {
    const activity = io.of('/activity');

    // Authenticate socket connections via JWT
    activity.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error('Unauthorized'));
        try {
            const payload = jwt.verify(token, JWT_SECRET);
            socket.userId = payload.userId;
            next();
        } catch {
            next(new Error('Invalid token'));
        }
    });

    activity.on('connection', (socket) => {
        let channelId = null;

        socket.on('join_session', async ({ channelId: cId, guildId }) => {
            channelId = cId;
            const room = `activity:${channelId}`;
            socket.join(room);

            // Track active players
            if (!activeSessions.has(channelId)) activeSessions.set(channelId, new Set());
            activeSessions.get(channelId).add(socket.userId);

            await broadcastSession(activity, channelId, guildId);
        });

        socket.on('disconnect', async () => {
            if (!channelId) return;
            const session = activeSessions.get(channelId);
            if (session) {
                session.delete(socket.userId);
                if (session.size === 0) {
                    activeSessions.delete(channelId);
                } else {
                    await broadcastSession(activity, channelId, null);
                }
            }
        });
    });

    // Bot → Activity: push economy updates to connected clients
    botEvents.on('economy:update', async ({ userId }) => {
        try {
            const profile = await prisma.profile.findFirst({
                where: { userId },
                select: { userId: true, balance: true, inBank: true },
            });
            if (!profile) return;

            activity.emit('economy_update', {
                userId: profile.userId,
                balance: parseFloat(profile.balance.toString()),
                inBank: parseFloat(profile.inBank.toString()),
            });
        } catch (err) {
            console.error('[SOCKET] economy:update error:', err);
        }
    });
};

/** Fetch profiles for all players in a session and broadcast session_update */
async function broadcastSession(namespace, channelId, guildId) {
    const session = activeSessions.get(channelId);
    if (!session) return;

    const playerIds = [...session];
    const profiles = await prisma.profile.findMany({
        where: { userId: { in: playerIds } },
        select: {
            userId: true,
            displayName: true,
            balance: true,
            inBank: true,
            level: true,
            experiences: true,
            reputations: true,
        },
    });

    namespace.to(`activity:${channelId}`).emit('session_update', {
        channelId,
        guildId,
        players: profiles.map((p) => ({
            ...p,
            balance: parseFloat(p.balance.toString()),
            inBank: parseFloat(p.inBank.toString()),
        })),
    });
}
