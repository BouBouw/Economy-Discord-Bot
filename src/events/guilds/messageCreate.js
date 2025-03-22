const MessageStats = require("../../../handlers/functions/Statistics/MessageStats");

module.exports = {
	name: 'messageCreate',
	once: false,
execute: async (message, client, con) => {
    if(message.author.bot) return;

    await MessageStats.MessageUpdate(message);
    }
}