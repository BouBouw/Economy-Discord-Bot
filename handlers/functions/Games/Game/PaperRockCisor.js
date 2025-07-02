// games/RockPaperScissors.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Colors } = require('discord.js');

const CHOICES = {
    ROCK: { 
        id: 'rock', 
        emoji: '🪨', 
        label: 'Pierre',
        beats: 'scissors'
    },
    PAPER: { 
        id: 'paper', 
        emoji: '📃', 
        label: 'Feuille',
        beats: 'rock'
    },
    SCISSORS: { 
        id: 'scissors', 
        emoji: '✂️', 
        label: 'Ciseaux',
        beats: 'paper'
    }
};

const GAME_CONFIG = {
    WIN_SCORE: 3,
    ROUND_DELAY: 5000,
    CHOICE_TIMEOUT: 15000,
    START_DELAY: 10000
};

async function playRockPaperScissors(channel, gameHost, gameTable, guild) {
    // Initialisation de la partie
    const match = { 
        round: 0,
        state: 'playing'
    };

    const players = gameTable.map((member, index) => ({
        id: member.userID,
        name: `<@${member.userID}>`,
        score: 0,
        choice: null,
        message: null,
        isReady: false
    }));

    // Envoi du message de début
    await channel.send({
        content: `${players.map(p => p.name).join(', ')}\nLa partie commence dans **${GAME_CONFIG.START_DELAY/1000} secondes** !`,
        embeds: [createRulesEmbed()]
    });

    await new Promise(resolve => setTimeout(resolve, GAME_CONFIG.START_DELAY));
    startNextRound();

    // Fonction pour créer l'embed des règles
    function createRulesEmbed() {
        return new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle('🔹 Règles du Pierre-Feuille-Ciseaux')
            .setDescription('Premier à 3 points gagne la partie !')
            .addFields(
                { name: 'Gagnants', value: 'Pierre 🪨 bat Ciseaux ✂️\nFeuille 📃 bat Pierre 🪨\nCiseaux ✂️ bat Feuille 📃', inline: true },
                { name: 'Commandes', value: 'Cliquez sur les boutons pour faire votre choix\nTemps par tour: 15 secondes', inline: true }
            )
            .setFooter({ text: `Mode: ${players.length === 2 ? 'Duel' : 'Tournoi'}` });
    }

    // Gestion des rounds
    async function startNextRound() {
        if (match.state !== 'playing') return;

        match.round++;
        resetPlayerChoices();

        const roundEmbed = new EmbedBuilder()
            .setColor(Colors.Gold)
            .setTitle(`🎲 Round ${match.round}`)
            .setDescription(`Score actuel:\n${players.map(p => `${p.name}: ${p.score}`).join('\n')}`);

        await channel.send({ embeds: [roundEmbed] });

        // Envoi des choix pour chaque joueur
        for (const player of players) {
            if (player.score >= GAME_CONFIG.WIN_SCORE) continue;
            
            try {
                player.message = await channel.send({
                    content: `${player.name}, faites votre choix !`,
                    components: [createChoiceButtons()]
                });
                
                await handlePlayerChoice(player);
            } catch (error) {
                console.error(`Erreur envoi message à ${player.name}:`, error);
                handleAutoChoice(player);
            }
        }
    }

    // Création des boutons de choix
    function createChoiceButtons() {
        return new ActionRowBuilder().addComponents(
            Object.values(CHOICES).map(choice => 
                new ButtonBuilder()
                    .setCustomId(`game.${choice.id}`)
                    .setLabel(choice.label)
                    .setEmoji(choice.emoji)
                    .setStyle(ButtonStyle.Primary)
            )
        );
    }

    // Gestion du choix du joueur
    async function handlePlayerChoice(player) {
        const filter = i => i.user.id === player.id && i.isButton();
        
        try {
            const interaction = await player.message.awaitMessageComponent({ 
                filter, 
                time: GAME_CONFIG.CHOICE_TIMEOUT 
            });

            await interaction.deferUpdate();
            player.choice = interaction.customId.replace('game.', '');
            player.isReady = true;
            
            // Suppression du message après choix
            await player.message.delete().catch(() => {});
            player.message = null;

        } catch (error) {
            // Temps écoulé - choix aléatoire
            handleAutoChoice(player);
        } finally {
            checkRoundCompletion();
        }
    }

    // Choix automatique si timeout
    function handleAutoChoice(player) {
        const randomChoice = Object.keys(CHOICES)[
            Math.floor(Math.random() * Object.keys(CHOICES).length)
        ].toLowerCase();
        
        player.choice = randomChoice;
        player.isReady = true;
        channel.send(`${player.name} n'a pas choisi à temps, choix aléatoire: ${CHOICES[randomChoice.toUpperCase()].emoji}`);
        
        if (player.message) {
            player.message.delete().catch(() => {});
            player.message = null;
        }
    }

    // Vérification si tous ont joué
    function checkRoundCompletion() {
        if (players.every(p => p.isReady || p.score >= GAME_CONFIG.WIN_SCORE)) {
            processRoundResults();
        }
    }

    // Traitement des résultats du round
    async function processRoundResults() {
        const activePlayers = players.filter(p => p.score < GAME_CONFIG.WIN_SCORE);
        
        // Cas particulier - égalité générale
        if (new Set(activePlayers.map(p => p.choice)).size === 1) {
            await channel.send(`🔶 Égalité ! Tous ont choisi ${CHOICES[activePlayers[0].choice.toUpperCase()].emoji}`);
            return setTimeout(startNextRound, GAME_CONFIG.ROUND_DELAY);
        }

        // Détermination des gagnants du round
        for (const player of activePlayers) {
            const opponent = activePlayers.find(p => p.id !== player.id);
            if (!opponent) continue;

            if (CHOICES[player.choice.toUpperCase()].beats === opponent.choice) {
                player.score++;
                await channel.send(
                    `${player.name} gagne le round avec ${CHOICES[player.choice.toUpperCase()].emoji} ` +
                    `contre ${CHOICES[opponent.choice.toUpperCase()].emoji} ! ` +
                    `(Score: ${player.score})`
                );
            }
        }

        // Vérification fin de partie
        const winner = players.find(p => p.score >= GAME_CONFIG.WIN_SCORE);
        if (winner) {
            return endGame(winner);
        }

        // Nouveau round après délai
        setTimeout(startNextRound, GAME_CONFIG.ROUND_DELAY);
    }

    // Réinitialisation des choix
    function resetPlayerChoices() {
        players.forEach(p => {
            p.choice = null;
            p.isReady = false;
        });
    }

    // Fin de partie
    async function endGame(winner) {
        match.state = 'finished';
        
        const loser = players.find(p => p.id !== winner.id);
        const xpWin = 100, coinsWin = 40;
        const xpLose = 50, coinsLose = 20;

        await channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle('🏆 Fin de la partie !')
                    .setDescription(`Félicitations ${winner.name} !\nVictoire ${winner.score}-${loser.score}`)
                    .addFields(
                        { name: 'Récompenses', value: `${winner.name}: +${xpWin} XP | +${coinsWin} pièces\n${loser.name}: +${xpLose} XP | +${coinsLose} pièces` }
                    )
            ]
        });

        // Mise à jour des stats
        await UpdateUserStats(winner.id, true, xpWin, coinsWin);
        await UpdateUserStats(loser.id, false, xpLose, coinsLose);
        await EndGameTable(gameHost, gameTable, guild);
    }
}

module.exports = playRockPaperScissors;