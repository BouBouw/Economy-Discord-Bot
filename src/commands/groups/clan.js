const { ApplicationCommandType, ApplicationCommandOptionType } = require("discord.js");

module.exports = {
    name: 'clan',
    description: 'Gestion des clans (équipes)',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "action",
            description: "Action à effectuer",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                { name: "Créer un clan", value: "create" },
                { name: "Inviter un joueur", value: "invite" },
                { name: "Retirer un joueur", value: "remove" },
                { name: "Gérer un joueur", value: "manage" },
                { name: "Dissoudre le clan", value: "disband" },
                { name: "Infos du clan", value: "info" }
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

    }
}