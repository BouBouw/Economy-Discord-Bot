const { ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');

const Transfert = require('../../../handlers/functions/Images/Commands/Transfert');
const { ImageBuffer } = require('../../../handlers/functions/Images/FrameGenerator');
const Bank = require('../../../handlers/functions/Economy/Bank');

module.exports = {
    name: 'dev',
    description: '(💡) Utils',
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
    const amount = interaction.options.getNumber('montant');

    if (target.id === interaction.user.id) return interaction.reply({ 
        embeds: [{
            color: Colors.Blue,
            description: `Vous ne pouvez pas transférer des coins à vous-même.`
        }],
    });
    
    if (amount <= 0) return interaction.reply({ 
        embeds: [{
            color: Colors.Blue,
            description: `La somme du transfert doit être supérieure à **0**.`
        }],
    });

    Bank.bankTransfert(interaction.user, target, amount).then(async () => {
        let { canvas } = await Transfert(interaction, target, amount);
        const img = await ImageBuffer(canvas);
    
        interaction.reply({
            files: [ img ],
        });
    })

    }
}