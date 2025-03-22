const { ApplicationCommandType, Colors } = require('discord.js')

module.exports = {
    name: 'speed',
    description: '(💡) Utils',
    type: ApplicationCommandType.ChatInput,
execute: async (client, interaction, args, con) => {
    let ping = Date.now() - interaction.createdTimestamp;

    interaction.reply({
        embeds: [{
            color: Colors.Blue,
            description: `Latence : *${ping < 0 ? '-1' : ping }ms*\nWebSocket : *${Math.round(client.ws.ping)}ms*`
        }]
    })
    }
}