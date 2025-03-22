const { ApplicationCommandType, Colors, ApplicationCommandOptionType } = require('discord.js');
const Bank = require('../../../handlers/functions/Economy/Bank');
const ImageGenerator = require('../../../handlers/functions/Images/Imagegenerator');
const Profiles = require('../../../handlers/functions/Profiles');

module.exports = {
    name: 'transfert',
    description: '(🪙) Economy',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "membre",
            description: "Membre à qui transférer les coins",
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: "montant",
            description: "Nombre de coins à transférer",
            type: ApplicationCommandOptionType.Number,
            required: true,
        }
    ],
    execute: async (client, interaction, args, con) => {
        const target = interaction.options.getUser('membre');
        const coins = interaction.options.getNumber('montant');

        if (target.id === interaction.user.id) return interaction.reply({ 
            embeds: [{
                color: Colors.Blue,
                description: `Vous ne pouvez pas transférer des coins à vous-même.`
            }],
        });

        if (coins <= 0) return interaction.reply({ 
            embeds: [{
                color: Colors.Blue,
                description: `La somme du transfert doit être supérieure à **0**.`
            }],
        });

        Bank.bankTransfert(interaction.user, target, coins).then(async (res) => {
            const profile = await Profiles.getProfile(interaction.user);

            const bank_transaction = await ImageGenerator.BankTransfert(interaction, target, profile, coins);

            await interaction.reply({
                files: [bank_transaction],
            });
        })
    }
}