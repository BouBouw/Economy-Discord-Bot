// games/DiceRace.js
const { EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const RACE_CONFIG = {
    START_DELAY: 10000,       // 10 secondes
    TURN_DELAY: 5000,         // 5 secondes entre les tours
    FINISH_LINE: 20,          // Cases à parcourir
    DICE_FACES: ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'],
    BONUS_TILES: [5, 10, 15], // Cases bonus
    TRAP_TILES: [3, 8, 17],   // Cases pièges
    MINI_GAME_CHANCE: 0.3     // 30% de chance de déclencher un mini-jeu
};

async function playDiceRace(channel, gameHost, gameTable, guild) {
    const players = gameTable.map(member => ({
        id: member.userID,
        name: `<@${member.userID}>`,
        position: 0,
        boost: 0,
        lastRoll: 0,
        isEliminated: false
    }));

    let raceActive = true;
    let raceInterval;
    let currentRound = 0;

    // Initialisation de la course
    await showRaceIntro();
    await new Promise(resolve => setTimeout(resolve, RACE_CONFIG.START_DELAY));
    startRace();

    async function showRaceIntro() {
        const embed = new EmbedBuilder()
            .setColor(Colors.Gold)
            .setTitle('🎲 Course de Dés !')
            .setDescription(`Premier à atteindre la case ${RACE_CONFIG.FINISH_LINE} gagne !`)
            .addFields(
                { name: 'Participants', value: players.map(p => p.name).join('\n'), inline: true },
                { name: 'Particularités', value: 'Cases bonus (+2)\nCases pièges (-1)\nMini-jeux aléatoires', inline: true }
            )
            .setImage('https://i.imgur.com/JQ9w1W0.png'); // Image de piste de course

        await channel.send({
            content: `${players.map(p => p.name).join(', ')} Prêts pour la course ?`,
            embeds: [embed]
        });
    }

    function startRace() {
        raceInterval = setInterval(async () => {
            currentRound++;
            await playRound();
        }, RACE_CONFIG.TURN_DELAY);
    }

    async function playRound() {
        if (!raceActive) return;

        const embed = new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle(`🏁 Round ${currentRound}`);

        // Tour de chaque joueur
        for (const player of players.filter(p => !p.isEliminated)) {
            if (player.position >= RACE_CONFIG.FINISH_LINE) continue;

            await playerTurn(player, embed);
        }

        // Affichage du tableau de bord
        embed.addFields({
            name: 'Positions',
            value: players.map(p => 
                `${p.name}: ${'🟦'.repeat(Math.min(p.position, RACE_CONFIG.FINISH_LINE))}${'⬜'.repeat(RACE_CONFIG.FINISH_LINE - Math.min(p.position, RACE_CONFIG.FINISH_LINE))} ${p.position}/${RACE_CONFIG.FINISH_LINE}`
            ).join('\n')
        });

        await channel.send({ embeds: [embed] });

        // Vérification fin de course
        checkRaceEnd();
    }

    async function playerTurn(player, embed) {
        // Lancer de dé
        const roll = rollDice() + player.boost;
        player.lastRoll = roll;
        player.boost = 0; // Réinitialisation du boost

        // Application du mouvement
        player.position += roll;

        // Vérification des cases spéciales
        const specialTileEffect = checkSpecialTile(player);
        let turnDescription = `${player.name} a fait ${roll} (${RACE_CONFIG.DICE_FACES[roll-1]})`;

        if (specialTileEffect) {
            turnDescription += `\n${specialTileEffect}`;
        }

        // Mini-jeu aléatoire
        if (Math.random() < RACE_CONFIG.MINI_GAME_CHANCE) {
            const miniGameResult = await playMiniGame(player);
            if (miniGameResult) {
                turnDescription += `\n${miniGameResult}`;
            }
        }

        embed.addFields({
            name: `Tour de ${player.name}`,
            value: turnDescription,
            inline: true
        });
    }

    function rollDice() {
        return Math.floor(Math.random() * 6) + 1;
    }

    function checkSpecialTile(player) {
        if (RACE_CONFIG.BONUS_TILES.includes(player.position)) {
            player.boost = 2;
            return `✨ Case bonus! +2 au prochain lancer!`;
        }

        if (RACE_CONFIG.TRAP_TILES.includes(player.position)) {
            player.position = Math.max(0, player.position - 1);
            return `💥 Case piège! Reculez de 1 case!`;
        }

        return null;
    }

    async function playMiniGame(player) {
        const miniGames = [
            {
                name: "Pari sur le dé",
                description: "Devinez si votre prochain lancer sera >3",
                execute: async () => {
                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('high')
                                .setLabel('>3')
                                .setStyle(ButtonStyle.Success),
                            new ButtonBuilder()
                                .setCustomId('low')
                                .setLabel('≤3')
                                .setStyle(ButtonStyle.Danger)
                        );

                    const message = await channel.send({
                        content: `${player.name}, parier que votre prochain lancer sera supérieur à 3?`,
                        components: [row]
                    });

                    try {
                        const interaction = await message.awaitMessageComponent({
                            filter: i => i.user.id === player.id,
                            time: 10000
                        });

                        const guessHigh = interaction.customId === 'high';
                        const nextRoll = rollDice();
                        const didWin = (nextRoll > 3 && guessHigh) || (nextRoll <= 3 && !guessHigh);

                        if (didWin) {
                            player.boost = 3;
                            return `🎯 Pari gagné! +3 au prochain lancer!`;
                        } else {
                            player.position = Math.max(0, player.position - 2);
                            return `💢 Pari perdu... Reculez de 2 cases.`;
                        }
                    } catch {
                        return "⏱️ Temps écoulé pour le pari!";
                    }
                }
            },
            {
                name: "Double ou rien",
                description: "Tentez de doubler votre dernier lancer",
                execute: async () => {
                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('accept')
                                .setLabel('Tenter (50/50)')
                                .setStyle(ButtonStyle.Primary)
                        );

                    const message = await channel.send({
                        content: `${player.name}, voulez-vous tenter de doubler votre dernier lancer de ${player.lastRoll}?`,
                        components: [row]
                    });

                    try {
                        const interaction = await message.awaitMessageComponent({
                            filter: i => i.user.id === player.id,
                            time: 10000
                        });

                        if (Math.random() > 0.5) {
                            player.position += player.lastRoll;
                            return `🍀 Réussi! Avancez de ${player.lastRoll} cases supplémentaires!`;
                        } else {
                            player.position = Math.max(0, player.position - player.lastRoll);
                            return `☠️ Échec! Reculez de ${player.lastRoll} cases!`;
                        }
                    } catch {
                        return "⏱️ Temps écoulé!";
                    }
                }
            }
        ];

        const selectedGame = miniGames[Math.floor(Math.random() * miniGames.length)];
        return await selectedGame.execute();
    }

    function checkRaceEnd() {
        const finishers = players.filter(p => p.position >= RACE_CONFIG.FINISH_LINE && !p.isEliminated);
        
        if (finishers.length > 0) {
            endRace(finishers);
        }
    }

    async function endRace(finishers) {
        raceActive = false;
        clearInterval(raceInterval);

        // Tri par position
        finishers.sort((a, b) => b.position - a.position);
        const winner = finishers[0];

        // Calcul des récompenses
        const xpRewards = {
            gold: 100,
            silver: 70,
            bronze: 50,
            participant: 30
        };

        const coinRewards = {
            gold: 80,
            silver: 50,
            bronze: 30,
            participant: 20
        };

        // Embed de résultats
        const embed = new EmbedBuilder()
            .setColor(Colors.Gold)
            .setTitle('🏁 Course Terminée !')
            .setDescription(`**${winner.name}** remporte la course en ${currentRound} rounds !`)
            .setThumbnail('https://i.imgur.com/JQ9w1W0.png');

        // Classement
        const podium = finishers.slice(0, 3);
        const others = players.filter(p => !p.isEliminated && !finishers.includes(p));

        if (podium.length > 0) {
            embed.addFields({
                name: '🏆 Podium',
                value: podium.map((p, i) => 
                    `${['🥇', '🥈', '🥉'][i]} ${p.name} - Case ${p.position}`
                ).join('\n')
            });
        }

        if (others.length > 0) {
            embed.addFields({
                name: 'Autres participants',
                value: others.map(p => 
                    `▸ ${p.name} - Case ${p.position}`
                ).join('\n')
            });
        }

        await channel.send({ embeds: [embed] });

        // Distribution des récompenses
        for (let i = 0; i < finishers.length; i++) {
            const rewardType = i === 0 ? 'gold' : i === 1 ? 'silver' : 'bronze';
            await UpdateUserStats(
                finishers[i].id, 
                true, 
                xpRewards[rewardType], 
                coinRewards[rewardType]
            );
        }

        for (const player of others) {
            await UpdateUserStats(
                player.id,
                false,
                xpRewards.participant,
                coinRewards.participant
            );
        }

        await EndGameTable(gameHost, gameTable, guild);
    }
}

module.exports = playDiceRace;