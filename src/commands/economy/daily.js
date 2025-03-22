const { ApplicationCommandType, Colors } = require('discord.js');
const Rewards = require('../../../handlers/functions/Economy/Rewards');

module.exports = {
    name: 'daily',
    description: '(🪙) Economy',
    type: ApplicationCommandType.ChatInput,
    execute: async (client, interaction, args, con) => {
        const timeout = 86400000;
        const amount = 150;

        try {
            const result = await Rewards.Daily(interaction.user, amount, timeout);

            if (result.status === 'success') {
                return interaction.reply({
                    embeds: [{
                        color: Colors.Blue,
                        description: result.message
                    }]
                });
            } else if (result.status === 'cooldown') {
                return interaction.reply({
                    embeds: [{
                        color: Colors.Blue,
                        description: result.message
                    }]
                });
            }
        } catch (error) {
            console.error(error);
            return interaction.reply({
                embeds: [{
                    color: Colors.Red,
                    description: error.message || `Une erreur s'est produite lors de l'exécution de la commande.`
                }],
                ephemeral: true
            });
        }
    }
};