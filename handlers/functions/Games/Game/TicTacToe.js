const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Colors } = require('discord.js');
const Tables = require('../Tables');

const GAME_MODES = {
    CLASSIC: {
        id: 0,
        name: "Classique",
        gridSize: 3,
        symbolsToWin: 3,
        symbols: ['❌', '⭕'],
        duration: 10 * 60 * 1000, // 10 minutes
        xpWin: 30,
        coinsWin: 50
    },
    TEAM: {
        id: 1,
        name: "Équipe",
        gridSize: 8,
        symbolsToWin: 4,
        symbols: ['❌', '⭕', '🔵', '🔴'],
        duration: 15 * 60 * 1000, // 15 minutes
        xpWin: 50,
        coinsWin: 75
    }
};

const GAME_CONFIG = {
    START_DELAY: 10000, // 10 secondes
    TURN_DELAY: 3000    // 3 secondes entre les tours
};

async function playTicTacToe(channel, gameHost, gameTable, guild) {
    const mode = GAME_MODES[gameHost.gameMode === 0 ? 'CLASSIC' : 'TEAM'];
    const grid = Array(mode.gridSize).fill(null).map(() => Array(mode.gridSize).fill(null));
    
    const players = gameTable.map((member, index) => ({
        id: member.userID,
        name: `<@${member.userID}>`,
        symbol: mode.symbols[index % mode.symbols.length],
        team: mode.id === 1 ? Math.floor(index % 2) : index // Pour le mode équipe
    }));

    let currentPlayerIndex = 0;
    let gameMessage;
    let collector;
    let gameActive = true;

    // Initialisation du jeu
    await sendStartMessage();
    await new Promise(resolve => setTimeout(resolve, GAME_CONFIG.START_DELAY));
    startGame();

    async function sendStartMessage() {
        const modeDescription = mode.id === 0 
            ? "Affrontez votre adversaire dans un duel stratégique !" 
            : "Jouez en équipe pour aligner 4 symboles !";

        const embed = new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle(`🎮 Tic-Tac-Toe - Mode ${mode.name}`)
            .setDescription(modeDescription)
            .addFields(
                { name: 'Grille', value: `${mode.gridSize}x${mode.gridSize}`, inline: true },
                { name: 'Symboles à aligner', value: mode.symbolsToWin.toString(), inline: true },
                { 
                    name: 'Joueurs', 
                    value: players.map(p => `${p.name} (${p.symbol}${mode.id === 1 ? ` - Équipe ${p.team + 1}` : ''})`).join('\n') 
                }
            );

        await channel.send({
            content: `${players.map(p => p.name).join(', ')}\nLa partie commence dans **${GAME_CONFIG.START_DELAY/1000} secondes** !`,
            embeds: [embed]
        });
    }

    function startGame() {
        gameMessage = channel.send({
            content: getCurrentPlayerTurnMessage(),
            components: generateGrid()
        }).then(msg => {
            setupCollector(msg);
            return msg;
        }).catch(console.error);
    }

    function setupCollector(message) {
        collector = message.createMessageComponentCollector({
            filter: i => players.some(p => p.id === i.user.id),
            time: mode.duration
        });

        collector.on('collect', handleInteraction);
        collector.on('end', handleGameEnd);
    }

    async function handleInteraction(interaction) {
        if (!gameActive) return;

        const player = players[currentPlayerIndex];
        if (interaction.user.id !== player.id) {
            return interaction.reply({
                content: "⚠️ Ce n'est pas votre tour !",
                ephemeral: true
            });
        }

        const [_, row, col] = interaction.customId.split('_').map(Number);
        
        // Validation du coup
        if (grid[row][col] !== null) {
            return interaction.reply({
                content: "Cette case est déjà prise !",
                ephemeral: true
            });
        }

        grid[row][col] = player.symbol;
        
        await interaction.deferUpdate();
        checkGameState();
    }

    function checkGameState() {
        const currentPlayer = players[currentPlayerIndex];
        
        // Vérification victoire
        if (checkWin(currentPlayer.symbol)) {
            endGame(currentPlayer);
            return;
        }

        // Vérification égalité
        if (isGridFull()) {
            endGame(null);
            return;
        }

        // Passage au joueur suivant
        nextTurn();
    }

    function nextTurn() {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        
        // Pour le mode équipe, on passe au joueur suivant de l'autre équipe
        if (mode.id === 1) {
            const currentTeam = players[currentPlayerIndex].team;
            while (players[currentPlayerIndex].team === currentTeam) {
                currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
            }
        }

        updateGameMessage();
    }

    function updateGameMessage() {
        gameMessage.then(msg => {
            msg.edit({
                content: getCurrentPlayerTurnMessage(),
                components: generateGrid()
            }).catch(console.error);
        });
    }

    function generateGrid() {
        const rows = [];
        
        for (let i = 0; i < mode.gridSize; i++) {
            const row = new ActionRowBuilder();
            
            for (let j = 0; j < mode.gridSize; j++) {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`cell_${i}_${j}`)
                        .setLabel(grid[i][j] || '\u200b')
                        .setStyle(grid[i][j] ? ButtonStyle.Secondary : ButtonStyle.Primary)
                        .setDisabled(!gameActive || Boolean(grid[i][j]))
                );
            }
            
            rows.push(row);
        }
        
        return rows;
    }

    function checkWin(symbol) {
        // Vérification horizontale et verticale
        for (let i = 0; i < mode.gridSize; i++) {
            let horizontal = 0;
            let vertical = 0;
            
            for (let j = 0; j < mode.gridSize; j++) {
                horizontal = grid[i][j] === symbol ? horizontal + 1 : 0;
                vertical = grid[j][i] === symbol ? vertical + 1 : 0;
                
                if (horizontal >= mode.symbolsToWin || vertical >= mode.symbolsToWin) {
                    return true;
                }
            }
        }
        
        // Vérification diagonales
        for (let i = 0; i <= mode.gridSize - mode.symbolsToWin; i++) {
            for (let j = 0; j <= mode.gridSize - mode.symbolsToWin; j++) {
                let diagonal1 = 0;
                let diagonal2 = 0;
                
                for (let k = 0; k < mode.symbolsToWin; k++) {
                    diagonal1 = grid[i + k][j + k] === symbol ? diagonal1 + 1 : 0;
                    diagonal2 = grid[i + k][j + mode.symbolsToWin - 1 - k] === symbol ? diagonal2 + 1 : 0;
                    
                    if (diagonal1 >= mode.symbolsToWin || diagonal2 >= mode.symbolsToWin) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }

    function isGridFull() {
        return grid.every(row => row.every(cell => cell !== null));
    }

    function getCurrentPlayerTurnMessage() {
        const player = players[currentPlayerIndex];
        return `C'est au tour de ${player.name} (${player.symbol})${mode.id === 1 ? ` - Équipe ${player.team + 1}` : ''}`;
    }

    async function endGame(winner) {
        gameActive = false;
        collector.stop();

        if (winner) {
            const winEmbed = new EmbedBuilder()
                .setColor(Colors.Green)
                .setTitle('🎉 Victoire !')
                .setDescription(`${winner.name} a gagné la partie avec le symbole ${winner.symbol} !`)
                .addFields(
                    { name: 'Mode', value: mode.name, inline: true },
                    { name: 'Score', value: `${mode.gridSize}x${mode.gridSize}`, inline: true }
                );

            await channel.send({ embeds: [winEmbed] });

            // Mise à jour des stats
            await Tables.UpdateUserStats(winner.id, true, mode.xpWin, mode.coinsWin);
            
            // Pour le mode équipe, récompenser toute l'équipe
            if (mode.id === 1) {
                const teammates = players.filter(p => p.team === winner.team && p.id !== winner.id);
                for (const teammate of teammates) {
                    await Tables.UpdateUserStats(teammate.id, true, mode.xpWin / 2, mode.coinsWin / 2);
                }
            }

            // Pénalité pour les perdants
            const losers = players.filter(p => 
                mode.id === 0 ? p.id !== winner.id : p.team !== winner.team
            );
            
            for (const loser of losers) {
                await Tables.UpdateUserStats(loser.id, false, 10, 20);
            }

        } else {
            // Égalité
            const drawEmbed = new EmbedBuilder()
                .setColor(Colors.Orange)
                .setTitle('🤝 Égalité !')
                .setDescription('La grille est pleine sans vainqueur.');

            await channel.send({ embeds: [drawEmbed] });

            for (const player of players) {
                await Tables.UpdateUserStats(player.id, null, 15, 30);
            }
        }

        await Tables.EndGameTable(gameHost, gameTable, guild);
    }

    function handleGameEnd(_, reason) {
        if (reason === 'time' && gameActive) {
            channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setTitle('⏰ Temps écoulé')
                        .setDescription('La partie a été interrompue car le temps est écoulé.')
                ]
            });
            gameActive = false;
        }
    }
}

module.exports = playTicTacToe;