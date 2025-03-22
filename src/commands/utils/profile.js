const { ApplicationCommandType, ApplicationCommandOptionType, Colors } = require('discord.js');
const Profiles = require('../../../handlers/functions/Profiles');
const VoiceStats = require('../../../handlers/functions/Statistics/VoiceStats');

module.exports = {
    name: 'profile',
    description: '(💡) Utils',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "membre",
            description: "Membre a voir le profil",
            type: ApplicationCommandOptionType.User,
            required: false,
        },
    ],
execute: async (client, interaction, args, con) => {
    const target = interaction.options.getUser('membre') || interaction.user;

    const voice_time = await VoiceStats.getTime(interaction.user.id, interaction.guild.id);
    console.log(voice_time)

    const profile = await Profiles.getProfile(target);
    if(!profile) return interaction.reply({
        embeds: [{
            color: Colors.Red,
            description: `${target} n'as pas de profil actif.`
        }]
    })

    interaction.reply({ content: `${target} Profile` })
    }
}