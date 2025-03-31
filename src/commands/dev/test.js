const { ApplicationCommandType } = require('discord.js')
const { ImageBuffer } = require('../../../handlers/functions/Images/FrameGenerator');
const Developer = require('../../../handlers/functions/Images/Commands/Developer');

module.exports = {
    name: 'dev',
    description: '(💡) Utils',
    type: ApplicationCommandType.ChatInput,
execute: async (client, interaction, args, con) => {
    const {canvas} = await Developer(interaction);
    const img = await ImageBuffer(canvas);

    interaction.reply({
        files: [ img ]
    })
    }
}