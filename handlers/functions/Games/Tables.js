const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder, Colors } = require('discord.js');
const prisma = require('../../database');
const Group = require('./Groups/Group.js');
const playTicTacToe = require('./Game/TicTacToe.js');
const { createGameTable } = require('./Frame.js');

// Configuration des jeux et modes
const GAME_CONFIG = {
    games: {
        0: "Quizz Battle",
        1: "Tic-Tac-Toe",
        2: "Duel de Mots",
        3: "Course de Dés",
        4: "Codenames",
        5: "Loup-Garou",
        6: "Pierre Papier Ciseaux",
        7: "Poker",
        8: "Monopoly"
    },
    modes: {
        0: 2,
        1: 4,
        2: 6,
        3: 8,
        4: 10,
        5: 12
    }
};

class GameManager {
    static async manager(gameHost, gameTable, guild) {
        try {
            // Notifier tous les joueurs
            await this.notifyPlayers(gameHost, gameTable, guild);
            
            // Démarrer la partie après un délai
            setTimeout(async () => {
                await this.startGame(gameHost, gameTable, guild);
            }, 5000);
        } catch (error) {
            console.error('Error in GameManager.manager:', error);
        }
    }

    static async notifyPlayers(gameHost, gameTable, guild) {
        const notifications = gameTable.map(async (user) => {
            try {
                const member = await guild.members.fetch(user.userId);
                if (!member) return;
                
                await member.send({
                    embeds: [{
                        color: Colors.Blue,
                        description: `La partie va commencer dans 30 secondes...`,
                        fields: [
                            {
                                name: `${GAME_CONFIG.games[gameHost.gameType]}`,
                                value: `**Mode de jeu :** ${GAME_CONFIG.modes[gameHost.gameMode]} joueurs`
                            },
                            {
                                name: `Joueurs :`,
                                value: gameTable.map(entry => `<@${entry.userId}>`).join(', ') || 'Aucun adversaire pour le moment.'
                            }
                        ]
                    }]
                });
            } catch (err) {
                console.error(`Erreur lors de l'envoi du message à ${user.userId}:`, err);
            }
        });

        await Promise.all(notifications);
    }

    static async startGame(gameHost, gameTable, guild) {
        try {
            const channel = await this.getChannelThread(gameHost.uuid, guild);
            
            switch(gameHost.gameType) {
                case 1: // Tic-Tac-Toe
                    await createGameTable(channel, gameHost, gameTable, guild);
                    break;
                // Ajouter d'autres jeux ici
                default:
                    console.log(`Jeu non implémenté: ${gameHost.gameType}`);
            }
        } catch (error) {
            console.error('Error in startGame:', error);
        }
    }

    static async createGameTable(uuid, userID, gameType, gameMode, channel, message) {
        try {
            const maxPlayers = GAME_CONFIG.modes[gameMode];
            
            // Créer le thread pour la partie
            const thread = await channel.threads.create({
                name: `jeu-${uuid}`,
                autoArchiveDuration: 60,
                reason: `Game ID: ${uuid}`
            });
            
            if (thread.joinable) await thread.join();

            // Récupérer les membres du groupe
            const groupMembers = await Group.getActiveGroupMembers(userID);
            const availableSlots = maxPlayers - 1; // -1 pour le host
            const membersToAdd = groupMembers.slice(0, availableSlots);

            // Créer les tables en base de données
            await this.createDatabaseTables(uuid, userID, gameType, gameMode, membersToAdd);

            // Ajouter les membres au thread
            await this.addMembersToThread(thread, membersToAdd, gameType);

            // Finaliser la création de la partie
            await this.finalizeGameCreation(uuid, userID, gameType, gameMode, thread, message, membersToAdd, maxPlayers);
            
        } catch (error) {
            console.error('Error in createGameTable:', error);
            throw error;
        }
    }

            static async createDatabaseTables(uuid, userID, gameType, gameMode, membersToAdd) {
        await prisma.gameHosted.create({
            data: { uuid, hostId: userID, gameType, gameMode, players: { create: [{ userId: userID }, ...membersToAdd.map(id => ({ userId: id }))] } }
        });
    }

    static async addMembersToThread(thread, membersToAdd, gameType) {
        const addPromises = membersToAdd.map(async memberId => {
            try {
                await thread.members.add(memberId);
                await thread.send({
                    content: `[${membersToAdd.length + 1}/${GAME_CONFIG.modes[gameType]}] <@${memberId}> (membre du groupe) a rejoint la partie de **${GAME_CONFIG.games[gameType]}**.`
                });
            } catch (err) {
                console.error(`Erreur ajout membre ${memberId} au thread:`, err);
            }
        });

        await Promise.all(addPromises);
    }

    static async finalizeGameCreation(uuid, userID, gameType, gameMode, thread, message, membersToAdd, maxPlayers) {
        const gameHost = { uuid, hostID: userID, gameType, gameMode, maxPlayers };
        const gameTable = [{ userID }, ...membersToAdd.map(id => ({ userID: id }))];
        
        // Mettre à jour le message original
        await message.edit({
            content: `Votre partie de **${GAME_CONFIG.games[gameType]}** (${maxPlayers} joueurs) vient d'être créée.`,
            files: [await createGameTable(thread, gameHost, gameTable)],
            components: []
        });

        // Envoyer le message dans le thread
        const gameImage = await createGameTable(thread, gameHost, gameTable);
        await thread.send({
            content: `Une partie de **${GAME_CONFIG.games[gameType]}** vient d'être créée par <@${userID}>.\nMode de jeu : \`${maxPlayers} joueurs\`\nGame ID : ${uuid}`,
            files: [gameImage],
            components: [
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('game.join_game')
                        .setLabel("Rejoindre la partie")
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('game.cancel')
                        .setLabel("Annuler la partie")
                        .setStyle(ButtonStyle.Danger)
                )
            ]
        });

        // Ajouter l'host au thread
        await thread.members.add(userID);
        const currentPlayers = 1 + membersToAdd.length;
        await thread.send({
            content: `[${currentPlayers}/${maxPlayers}] <@${userID}> vient de créer la partie de **${GAME_CONFIG.games[gameType]}**.`
        });

        // Si la partie est déjà complète
        if (currentPlayers >= maxPlayers) {
            const fullGameTable = await this.getGameTable(uuid);
            await this.manager(gameHost, fullGameTable, message.guild);
        }
    }

    static async joinGameTable(interaction) {
        try {
            let page = 0;
            let filters = new Set();
            const pageSize = 5;

            const response = await interaction.reply({
                embeds: [{ description: 'Chargement des parties en cours...' }],
                components: [],
            });

            const updateMessage = async () => {
                const { embed, components } = await this.generateGameList(page, filters, pageSize);
                await response.edit({ embeds: [embed], components });
            };

            await updateMessage();

            const collector = response.createMessageComponentCollector({ time: 60000 });

            collector.on('collect', async i => {
                if (i.user.id !== interaction.user.id) return;

                if (i.customId.startsWith('game.')) {
                    if (i.customId === 'game.first_page') page = 0;
                    if (i.customId === 'game.prev_page') page = Math.max(0, page - 1);
                    if (i.customId === 'game.next_page') page++;
                    if (i.customId === 'game.last_page') page = Infinity;
                }
                
                if (i.customId.startsWith('filter.')) {
                    await i.deferUpdate();
                    const filter = i.customId.split('.')[1];
                    filters.has(filter) ? filters.delete(filter) : filters.add(filter);
                    page = 0;
                }

                if (i.customId === 'game.select') {
                    const selectedGame = i.values[0];
                    if (selectedGame === 'no_data') {
                        await interaction.followUp({ content: 'Aucune partie disponible.', ephemeral: true });
                    } else {
                        await this.verifyGameTable(selectedGame, i);
                    }
                }
                
                await updateMessage();
            });
        } catch (error) {
            console.error('Error in joinGameTable:', error);
            await interaction.reply({
                content: 'Une erreur est survenue lors du chargement des parties.',
                ephemeral: true
            });
        }
    }

    static async generateGameList(page, filters, pageSize) {
        const games = await this.fetchGames(filters);
        const totalPages = Math.ceil(games.length / pageSize);
        page = Math.max(0, Math.min(page, totalPages - 1));
        
        const start = page * pageSize;
        const pageData = games.slice(start, start + pageSize);

        const embed = new EmbedBuilder()
            .setColor(Colors.Blue)
            .setFooter({ text: `Page: ${page + 1}/${totalPages}` });

        if (pageData.length === 0) {
            embed.setDescription('Aucune partie en ligne active.');
        } else {
            embed.setDescription(
                pageData.map((entry, index) => 
                    `\`#${start + index + 1}\` <@${entry.hostId}>
                    Crée le: <t:${Math.floor(entry.createdAt / 1000)}:f>
                    **Jeu:** ${GAME_CONFIG.games[entry.gameType]}
                    **Mode:** ${GAME_CONFIG.modes[entry.gameMode]} joueurs`
                ).join('\n\n')
            );
        }

        return {
            embed,
            components: this.generateComponents(totalPages, page, pageData, filters)
        };
    }

            static async fetchGames(filters) {
        const where = filters.size > 0 ? { gameType: { in: Array.from(filters).map(Number) } } : {};
        return prisma.gameHosted.findMany({ where, orderBy: { createdAt: 'desc' } });
    }

    static generateComponents(totalPages, currentPage, pageData, filters) {
        const filterButtons = Object.keys(GAME_CONFIG.games).map(gameType =>
            new ButtonBuilder()
                .setCustomId(`filter.${gameType}`)
                .setLabel(GAME_CONFIG.games[gameType])
                .setStyle(filters.has(gameType) ? ButtonStyle.Success : ButtonStyle.Secondary)
        );

        const filterRows = [];
        for (let i = 0; i < filterButtons.length; i += 5) {
            filterRows.push(new ActionRowBuilder().addComponents(filterButtons.slice(i, i + 5)));
        }

        return [
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('game.first_page')
                        .setLabel('⏮️ Première page')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage === 0),
                    new ButtonBuilder()
                        .setCustomId('game.prev_page')
                        .setLabel('⬅️ Page précédente')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage === 0),
                    new ButtonBuilder()
                        .setCustomId('game.next_page')
                        .setLabel('➡️ Page suivante')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage >= totalPages - 1),
                    new ButtonBuilder()
                        .setCustomId('game.last_page')
                        .setLabel('⏭️ Dernière page')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage >= totalPages - 1)
                ),
            ...filterRows,
            new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('game.select')
                        .setPlaceholder('Choisissez une partie à rejoindre')
                        .addOptions(
                            pageData.length > 0 ?
                            pageData.slice(0, Math.min(pageData.length, 25)).map(entry =>
                                new StringSelectMenuOptionBuilder()
                                    .setLabel(`[1/${GAME_CONFIG.modes[entry.gameMode]}] ${GAME_CONFIG.games[entry.gameType]} - ${GAME_CONFIG.modes[entry.gameMode]} joueurs`.substring(0, 100))
                                    .setValue(entry.uuid)
                            ) :
                            [new StringSelectMenuOptionBuilder()
                                .setLabel('Aucune partie disponible')
                                .setValue('no_data')]
                        )
                )
        ];
    }

    static async verifyGameTable(uuid, interaction) {
        try {
            const [gameHost, gameTable] = await Promise.all([
                this.getGameStats(uuid),
                this.getGameTable(uuid)
            ]);

            const maxPlayers = GAME_CONFIG.modes[gameHost.gameMode];

            // Vérifications
            if (interaction.user.id === gameHost.hostId) {
                return interaction.reply({
                    content: `Vous ne pouvez pas rejoindre la partie car vous êtes l'organisateur.`,
                    ephemeral: true
                });
            }
            
            if (gameTable.some(entry => entry.userId === interaction.user.id)) {
                return interaction.reply({
                    content: `Vous ne pouvez pas rejoindre la partie car vous êtes déjà dans la partie.`,
                    ephemeral: true
                });
            }
            
            if (gameTable.length >= maxPlayers) {
                return interaction.reply({
                    content: `Vous ne pouvez pas rejoindre la partie car elle est déjà pleine.`,
                    ephemeral: true
                });
            }

            // Vérifier si le joueur fait partie du groupe de l'owner
            const isInGroup = await this.isUserInGroup(interaction.user.id, gameHost.hostID);

            // Ajouter le joueur à la partie
            await prisma.gamePlayer.create({ data: { gameUuid: uuid, userId: interaction.user.id } });

            const channel = await this.getChannelThread(uuid, interaction.guild);
            const newGameTable = await this.getGameTable(uuid);

            // Ajouter le joueur au thread
            await channel.members.add(interaction.user.id);

            // Mettre à jour l'affichage
            await this.updateGameDisplay(channel, gameHost, newGameTable, interaction.guild, interaction.client);

            // Répondre à l'utilisateur
            await interaction.reply({
                content: `Vous avez ${isInGroup ? 'été ajouté' : 'rejoint'} la partie de **${GAME_CONFIG.games[gameHost.gameType]}**`,
                files: [await createGameTable(channel, gameHost, newGameTable, interaction.guild)]
            });

            // Si la partie est complète, la démarrer
            if (newGameTable.length === maxPlayers) {
                const newGameHost = await this.getGameStats(uuid);
                await this.updateGameDisplay(channel, newGameHost, newGameTable, interaction.guild, interaction.client);
                await this.manager(newGameHost, newGameTable, interaction.guild);
            }
        } catch (error) {
            console.error('Error in verifyGameTable:', error);
            await interaction.reply({
                content: 'Une erreur est survenue lors de votre tentative de rejoindre la partie.',
                ephemeral: true
            });
        }
    }

            static async isUserInGroup(userId, hostId) {
        const group = await prisma.group.findFirst({ where: { ownerId: hostId, status: 'active', groupPlayers: { contains: userId } } });
        return group !== null;
    }

    static async updateGameDisplay(channel, gameHost, gameTable, guild, client) {
        try {
            const gameImage = await createGameTable(channel, gameHost, gameTable, guild);
            const messages = await channel.messages.fetch({ limit: 10 });
            const gameMessage = messages.find(m => 
                m.author.id === client.user.id && 
                (m.attachments.size > 0 || m.content.includes('Partie de'))
            );
        
            if (gameMessage) {
                await gameMessage.edit({
                    content: `[${gameTable.length}/${gameHost.maxPlayers}] Partie de **${GAME_CONFIG.games[gameHost.gameType]}** en cours`,
                    files: [gameImage],
                    components: gameMessage.components
                });
            } else {
                await channel.send({
                    content: `[${gameTable.length}/${gameHost.maxPlayers}] Partie de **${GAME_CONFIG.games[gameHost.gameType]}** en cours`,
                    files: [gameImage],
                    components: [
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('game.join_game')
                                .setLabel("Rejoindre")
                                .setStyle(ButtonStyle.Success)
                                .setDisabled(gameTable.length >= gameHost.maxPlayers),
                            new ButtonBuilder()
                                .setCustomId('game.cancel')
                                .setLabel("Annuler")
                                .setStyle(ButtonStyle.Danger)
                        )
                    ]
                });
            }
        } catch (error) {
            console.error('Error in updateGameDisplay:', error);
        }
    }

            static async endGameTable(gameHost, gameTable, guild) {
        try {
            await new Promise(resolve => setTimeout(resolve, 10000));
            const channel = await this.getChannelThread(gameHost.uuid, guild);
            await channel.delete();
            await prisma.$transaction([prisma.gamePlayer.deleteMany({ where: { gameUuid: gameHost.uuid } }), prisma.gameHosted.delete({ where: { uuid: gameHost.uuid } })]);
        } catch (error) { console.error('Error in endGameTable:', error); }
    }

    static async getChannelThread(uuid, guild) {
        try {
            for (const channel of guild.channels.cache.values()) {
                if (channel.isTextBased() && channel.threads) {
                    const activeThreads = await channel.threads.fetchActive();
                    const archivedThreads = await channel.threads.fetchArchived();

                    const allThreads = [...activeThreads.threads.values(), ...archivedThreads.threads.values()];
                    const thread = allThreads.find(t => t.name === `jeu-${uuid}`);

                    if (thread) return thread;
                }
            }
            throw new Error(`Thread not found for game ${uuid}`);
        } catch (error) {
            console.error('Error in getChannelThread:', error);
            throw error;
        }
    }

            static async getGameStats(uuid) { return prisma.gameHosted.findUnique({ where: { uuid } }); }

            static async getGameTable(uuid) { return prisma.gamePlayer.findMany({ where: { gameUuid: uuid } }); }


    static async tablesManager(client) {
        client.on('interactionCreate', async (interaction) => {
            if (!interaction.isButton()) return;

            try {
                const uuid = interaction.channel.name.split('-')[1];
                
                switch(interaction.customId) {
                    case 'game.join_game':
                        await this.verifyGameTable(uuid, interaction);
                        break;
                        
                    case 'game.cancel':
                        const gameHost = await this.getGameStats(uuid);
                        
                        if (interaction.user.id !== gameHost.hostID) {
                            return interaction.reply({
                                content: `Vous n'êtes pas l'organisateur de la partie.`,
                                ephemeral: true
                            });
                        }
                        
                        await this.endGameTable(gameHost, [], interaction.guild);
                        break;
                }
            } catch (error) {
                console.error('Error in tablesManager:', error);
            }
        });
    }

            static async updateUserStats(userID, isWin, expGain = 10, coinReward = 50) {
        await prisma.profile.updateMany({ where: { userId: userID }, data: { experiences: { increment: expGain }, balance: { increment: coinReward } } });
    }
}

module.exports = GameManager;