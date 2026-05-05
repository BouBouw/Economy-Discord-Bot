/**
 * Shared EventEmitter between the Discord bot and the Socket.IO server.
 * The bot emits events here; Socket.IO listens and broadcasts to Activity clients.
 *
 * Usage (bot side):
 *   const botEvents = require('./src/website/server/events');
 *   botEvents.emit('economy:update', { userId: '...' });
 */
const { EventEmitter } = require('events');

module.exports = new EventEmitter();
