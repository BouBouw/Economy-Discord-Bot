const { ApplicationCommandType, Colors, ApplicationCommandOptionType, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const GameManager = require('../../../handlers/functions/Games/Tables.js');

// Configuration des jeux
const GAME_CONFIG = {
    types: {
        0: {
            name: "Quizz Battle",
            description: "Répondez vite à des questions pour gagner des points !",
            value: "game.quizz_battle",
            allowedSizes: [0, 1] // Correspond à 2 et 4 joueurs
        },
        1: {
            name: "Tic-Tac-Toe",
            description: "Remplissez une ligne en équipe sur une grille stratégique.",
            value: "game.tic_tac_toe",
            allowedSizes: [0, 1]
        },
        2: {
            name: "Duel de Mots",
            description: "Trouvez des mots en suivant la dernière lettre donnée.",
            value: "game.words_battle",
            allowedSizes: [0, 1, 2, 3, 4, 5] // 2 à 12 joueurs
        },
        3: {
            name: "Course de Dés",
            description: "Avancez sur le plateau en lançant les dés et atteignez l'arrivée !",
            value: "game.dices_race",
            allowedSizes: [0, 1, 2, 3, 4, 5]
        },
        4: {
            name: "Codenames",
            description: "Devinez des mots avec des indices donnés par votre coéquipier.",
            value: "game.codenames",
            allowedSizes: [0, 1, 2, 3, 4] // 2 à 10 joueurs
        },
        5: {
            name: "Loup-Garou",
            description: "Déduisez, bluffez et survivez pour éliminer ou démasquer les Loups-Garous !",
            value: "game.werewolf",
            allowedSizes: [3, 4, 5] // 8 à 12 joueurs
        },
        6: {
            name: "Pierre Feuille Ciseaux",
            description: "Battez vos adversaires dans un tournoi classique.",
            value: "game.rock_paper_cissor",
            allowedSizes: [0] // 2 joueurs
        },
        7: {
            name: "Poker",
            description: "Jouez a la vraie table de poker.",
            value: "game.poker",
            allowedSizes: [2, 3, 5] // 6, 8 et 12 joueurs
        }
    },
    modes: {
        0: 2,
        1: 4,
        2: 6,
        3: 8,
        4: 10,
        5: 12
    },
    modeMapping: {
        2: 0,
        4: 1,
        6: 2,
        8: 3,
        10: 4,
        12: 5
    }
};

function generateRandomUUID() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';

    for (let i = 0; i < 5; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }

    return result;
}

function parseGameType(value) {
    const gameEntry = Object.entries(GAME_CONFIG.types).find(([_, v]) => v.value === value);
    return gameEntry ? parseInt(gameEntry[0]) : null;
}

function generateModeButtons(gameType) {
    const allowedSizes = GAME_CONFIG.types[gameType].allowedSizes;
    const chunkSize = 5;
    const chunks = [];

    for (let i = 0; i < allowedSizes.length; i += chunkSize) {
        chunks.push(allowedSizes.slice(i, i + chunkSize));
    }

    return chunks.map(chunk => (
        new ActionRowBuilder().addComponents(
            chunk.map(item => (
                new ButtonBuilder()
                    .setCustomId(`players.${item}`)
                    .setLabel(`${GAME_CONFIG.modes[item]} joueurs`)
                    .setStyle(ButtonStyle.Secondary)
            ))
        )
    ));
}

module.exports = {
    name: 'games',
    description: '(🎲) Games',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "action",
            description: "Créer ou Rejoindre une partie",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: 'Créer une partie',
                    value: 'create'
                },
                {
                    name: 'Rejoindre une partie',
                    value: 'join'
                },
            ]
        },
    ],
    execute: async (client, interaction) => {
        const action = interaction.options.getString('action');

        try {
            switch (action) {
                case 'create': {
                    await handleCreateGame(interaction);
                    break;
                }
                case 'join': {
                    await GameManager.joinGameTable(interaction);
                    break;
                }
            }
        } catch (error) {
            console.error('Error in games command:', error);
            await interaction.reply({
                content: 'Une erreur est survenue lors du traitement de votre commande.',
                ephemeral: true
            });
        }
    }
};

async function handleCreateGame(interaction) {
    // Envoyer le menu de sélection du jeu
    const message = await interaction.reply({
        embeds: [{
            color: Colors.Blue,
            fields: [{
                name: `Jeux disponibles :`,
                value: Object.values(GAME_CONFIG.types).map(t => `**${t.name}**`).join('\n\n')
            }]
        }],
        components: [
            new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('games_selector')
                    .setPlaceholder("Choisissez un jeu")
                    .addOptions(
                        Object.values(GAME_CONFIG.types).map(game => (
                            new StringSelectMenuOptionBuilder()
                                .setLabel(game.name)
                                .setDescription(game.description)
                                .setValue(game.value)
                        ))
                    ))
        ],
        fetchReply: true
    });

    // Gérer la sélection du jeu
    const gameSelect = await message.awaitMessageComponent({
        filter: i => i.user.id === interaction.user.id && i.isStringSelectMenu(),
        time: 60000
    }).catch(() => null);

    if (!gameSelect) return message.delete();

    await gameSelect.deferUpdate();
    const gameValue = gameSelect.values[0];
    const gameType = parseGameType(gameValue);
    const gameInfo = GAME_CONFIG.types[gameType];

    // Envoyer le menu de sélection du mode
    await message.edit({
        embeds: [{
            color: Colors.Blue,
            description: `Jeux en Ligne > **__${gameInfo.name}__**`,
            fields: [{
                name: `Modes disponibles :`,
                value: gameInfo.allowedSizes.map(s => `\`${GAME_CONFIG.modes[s]}\` joueurs`).join(', ')
            }]
        }],
        components: generateModeButtons(gameType)
    });

    // Gérer la sélection du mode
    const modeSelect = await message.awaitMessageComponent({
        filter: i => i.user.id === interaction.user.id && i.isButton(),
        time: 60000
    }).catch(() => null);

    if (!modeSelect) return message.delete();

    await modeSelect.deferUpdate();
    const modeIndex = parseInt(modeSelect.customId.split('.')[1]);
    const playerCount = GAME_CONFIG.modes[modeIndex];
    const modeValue = GAME_CONFIG.modeMapping[playerCount];

    // Créer la partie
    const uuid = generateRandomUUID();
    await GameManager.createGameTable(
        uuid,
        interaction.user.id,
        gameType,
        modeValue,
        interaction.channel,
        message
    );
}