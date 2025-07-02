const GroupDecline = require("../../../handlers/functions/Games/Groups/Pending");

module.exports = {
	name: 'interactionCreate',
	once: false,
execute: async (interaction, client, con) => {
    await GroupDecline(interaction)
    }
}