const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

require('dotenv').config();

/**
 * Starts the Activity web server.
 * Called by index.js once the Discord bot is ready.
 *
 * @param {import('discord.js').Client} client - The Discord.js client
 * @returns {{ app, io, httpServer }}
 */
async function load(client) {
    const app = express();
    const httpServer = createServer(app);

    const io = new Server(httpServer, {
        cors: { origin: '*', methods: ['GET', 'POST'] },
    });

    app.use(cors());
    app.use(express.json());

    // Make Discord client accessible in routes if needed
    app.set('discordClient', client);
    app.set('io', io);

    // REST routes
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/profile', require('./routes/api'));

    // Serve the Vite build in production
    if (process.env.NODE_ENV === 'production') {
        const clientDist = path.join(__dirname, '../client/dist');
        app.use(express.static(clientDist));
        app.get('*', (_req, res) =>
            res.sendFile(path.join(clientDist, 'index.html'))
        );
    }

    // Socket.IO setup
    require('./socket')(io, client);

    const PORT = process.env.WEB_PORT || 3001;
    httpServer.listen(PORT, () => {
        const colors = require('colors');
        console.log(
            `[WEB] `.bold.blue +
            `Activity server started`.bold.white +
            ` (http://localhost:${PORT})`.bold.blue
        );
    });

    return { app, io, httpServer };
}

module.exports = { load };
