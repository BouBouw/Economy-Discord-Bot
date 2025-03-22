const { ApplicationCommandType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const Leaderboards = require('../../../handlers/functions/Economy/Leaderboards')

module.exports = {
    name: 'leaderboard',
    description: '(🪙) Economy',
    type: ApplicationCommandType.ChatInput,
execute: async (client, interaction, args, con) => {
    let sortBy = '' || 'economy';

    let page = 1;
    const limit = 10;

    const leaderboard_data = await Leaderboards.getEconomyLead(sortBy, page, limit);

    console.log(leaderboard_data);
    return interaction.reply({
        files: [],
        components: [
            new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId('filter.economy')
                .setLabel("Economie")
                .setStyle(sortBy === 'economy' ? ButtonStyle.Primary : ButtonStyle.Secondary)
                .setDisabled(sortBy === 'economy' ? true : false),
                new ButtonBuilder()
                .setCustomId('filter.ranks')
                .setLabel("Niveaux")
                .setStyle(sortBy === 'ranks' ? ButtonStyle.Primary : ButtonStyle.Secondary)
                .setDisabled(sortBy === 'ranks' ? true : false),
            ),
            new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId('embeds.first_page')
                .setLabel("Première Page")
                .setStyle(ButtonStyle.Primary),
            )
        ]
    }).then(async (msg) => {

    })
    }
}