const { ApplicationCommandType, ApplicationCommandOptionType } = require("discord.js");
const Group = require("../../../handlers/functions/Games/Groups/Group"); // Chemin vers votre module Group

module.exports = {
    name: 'group',
    description: 'Gestion des groupes de jeu',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "action",
            description: "Action à effectuer",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                { name: "Inviter un joueur", value: "invite" },
                { name: "Retirer un joueur", value: "remove" },
                { name: "Dissoudre le groupe", value: "disband" },
                { name: "Infos du groupe", value: "info" }
            ]
        },
        {
            name: "joueur",
            description: "Joueur concerné",
            type: ApplicationCommandOptionType.User,
            required: false
        }
    ],
    execute: async (client, interaction, args, con) => {
        const action = interaction.options.getString('action');
        const targetUser = interaction.options.getUser('joueur');
        const userId = interaction.user.id;

        try {
            switch (action) {
                case 'invite':
                    if (!targetUser) {
                        return interaction.reply({ 
                            content: "Vous devez spécifier un joueur à inviter", 
                            ephemeral: true 
                        });
                    }
                    Group.handleGroupRequest(interaction, userId, targetUser.id);
                    break;

                case 'remove':
                    if (!targetUser) {
                        return interaction.reply({ 
                            content: "Vous devez spécifier un joueur à retirer", 
                            ephemeral: true 
                        });
                    }
                    Group.removePlayer(interaction, userId, targetUser.id);
                    break;

                case 'disband':
                    Group.disbandGroup(interaction, userId);
                    break;

                case 'info':
                    Group.getGroupInfo(interaction, userId);
                    break;
            }
        } catch (error) {
            console.error("Erreur dans la commande /group:", error);
            interaction.reply({ 
                content: "Une erreur est survenue lors du traitement de votre requête", 
                ephemeral: true 
            });
        }
    }
};