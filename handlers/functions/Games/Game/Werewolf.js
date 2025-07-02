const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Colors } = require('discord.js');
const Tables = require('../Tables');

const ROLES = {
    LOUP_GAROU: {
        id: 0,
        name: "Loup-Garou",
        emoji: "🐺",
        team: "LOUPS",
        description: "Chaque nuit, dévorez un villageois avec vos comparses",
        nightAction: true
    },
    VOYANTE: {
        id: 1,
        name: "Voyante",
        emoji: "🔮",
        team: "VILLAGE",
        description: "Chaque nuit, découvrez le rôle d'un joueur",
        nightAction: true
    },
    SORCIERE: {
        id: 2,
        name: "Sorcière",
        emoji: "🧪",
        team: "VILLAGE",
        description: "Vous avez une potion de vie et une potion de mort",
        nightAction: true
    },
    CHASSEUR: {
        id: 3,
        name: "Chasseur",
        emoji: "🏹",
        team: "VILLAGE",
        description: "Quand vous mourez, emmenez un joueur avec vous",
        deathAction: true
    },
    CUPIDON: {
        id: 4,
        name: "Cupidon",
        emoji: "💘",
        team: "VILLAGE",
        description: "Le premier nuit, liez 2 joueurs en amoureux",
        firstNightAction: true
    },
    PETITE_FILLE: {
        id: 5,
        name: "Petite Fille",
        emoji: "👧",
        team: "VILLAGE",
        description: "Vous pouvez espionner les loups (mais danger!)",
        specialAction: true
    },
    VILLAGEOIS: {
        id: 6,
        name: "Villageois",
        emoji: "👨🌾",
        team: "VILLAGE",
        description: "Vous n'avez pas de pouvoir spécial"
    }
};

const GAME_CONFIG = {
    START_DELAY: 10000, // 10 secondes
    NIGHT_DURATION: 30000, // 30 secondes
    DAY_DURATION: 45000, // 45 secondes
    VOTE_DURATION: 30000, // 30 secondes
    MIN_PLAYERS: 5,
    MAX_PLAYERS: 15
};

async function playWerewolf(channel, gameHost, gameTable, guild) {
    // Vérification du nombre de joueurs
    if (gameTable.length < GAME_CONFIG.MIN_PLAYERS || gameTable.length > GAME_CONFIG.MAX_PLAYERS) {
        await channel.send(`❌ Le Loup-Garou nécessite entre ${GAME_CONFIG.MIN_PLAYERS} et ${GAME_CONFIG.MAX_PLAYERS} joueurs.`);
        return Tables.EndGameTable(gameHost, gameTable, guild);
    }

    const gameState = {
        phase: "SETUP",
        dayNumber: 0,
        players: gameTable.map(player => ({
            ...player,
            role: null,
            alive: true,
            protected: false,
            lover: false,
            votes: 0
        })),
        rolesDistribution: {},
        votes: {},
        eventsLog: [],
        lovers: [],
        witch: {
            healPotion: true,
            killPotion: true
        },
        gameActive: true
    };

    // Initialisation du jeu
    await sendStartMessage();
    await new Promise(resolve => setTimeout(resolve, GAME_CONFIG.START_DELAY));
    distributeRoles();
    await startGame();

    async function sendStartMessage() {
        const embed = new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle("🐺 La partie de Loup-Garou commence !")
            .setDescription(`Mode classique avec ${gameTable.length} joueurs`)
            .addFields(
                { name: 'Joueurs', value: gameTable.map(p => `<@${p.userID}>`).join('\n') }
            );

        await channel.send({
            content: `${gameTable.map(p => `<@${p.userID}>`).join(', ')}\nLa partie commence dans **${GAME_CONFIG.START_DELAY/1000} secondes** !`,
            embeds: [embed]
        });
    }

    function distributeRoles() {
        // Configuration des rôles basée sur le nombre de joueurs
        const rolesToAssign = [];
        
        // Base roles
        rolesToAssign.push(ROLES.LOUP_GAROU);
        if (gameTable.length >= 6) rolesToAssign.push(ROLES.LOUP_GAROU);
        if (gameTable.length >= 8) rolesToAssign.push(ROLES.SORCIERE);
        if (gameTable.length >= 7) rolesToAssign.push(ROLES.VOYANTE);
        if (gameTable.length >= 9) rolesToAssign.push(ROLES.CHASSEUR);
        if (gameTable.length >= 10) rolesToAssign.push(ROLES.CUPIDON);
        if (gameTable.length >= 12) rolesToAssign.push(ROLES.PETITE_FILLE);
        
        // Fill with villagers
        while (rolesToAssign.length < gameTable.length) {
            rolesToAssign.push(ROLES.VILLAGEOIS);
        }
        
        // Shuffle and assign
        const shuffledRoles = shuffleArray(rolesToAssign);
        gameState.players.forEach((player, index) => {
            player.role = shuffledRoles[index];
            gameState.rolesDistribution[player.role.name] = (gameState.rolesDistribution[player.role.name] || 0) + 1;
        });
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    async function startGame() {
        // Envoi des rôles en MP
        await sendRolesToPlayers();
        
        // Phase Cupidon (première nuit spéciale)
        await handleCupidonPhase();
    }

    async function sendRolesToPlayers() {
        for (const player of gameState.players) {
            try {
                const embed = new EmbedBuilder()
                    .setColor(player.role.team === "LOUPS" ? Colors.Red : Colors.Green)
                    .setTitle(`🎭 Vous êtes ${player.role.name} ${player.role.emoji}`)
                    .setDescription(player.role.description)
                    .addFields(
                        { name: 'Equipe', value: player.role.team === "LOUPS" ? "Loups-Garous" : "Villageois", inline: true }
                    );

                await player.send({ embeds: [embed] });
            } catch (error) {
                console.error(`Failed to DM ${player.username}`);
                await channel.send(`${player.username}, active tes MPs pour recevoir ton rôle !`);
            }
        }

        // Afficher la distribution des rôles
        const rolesEmbed = new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle("📜 Distribution des rôles")
            .setDescription(Object.entries(gameState.rolesDistribution)
                .map(([role, count]) => `${role} x${count}`)
                .join('\n'));

        await channel.send({ embeds: [rolesEmbed] });
    }

    async function handleCupidonPhase() {
        const cupidon = gameState.players.find(p => p.role.id === ROLES.CUPIDON.id);
        if (!cupidon) return startNight();

        await channel.send("💘 **Cupidon, choisis deux amoureux !** (20 secondes)");
        
        // Ici vous devriez implémenter la logique de sélection des amoureux
        // Par exemple avec des boutons ou un menu déroulant
        
        // Simulation de sélection aléatoire pour l'exemple
        await new Promise(resolve => setTimeout(resolve, 20000));
        const potentialLovers = gameState.players.filter(p => p.userID !== cupidon.userID);
        const lovers = shuffleArray(potentialLovers).slice(0, 2);
        
        gameState.lovers = lovers;
        lovers.forEach(p => p.lover = true);
        
        await channel.send(`💞 **Amoureux désignés :** ${lovers[0].username} et ${lovers[1].username}\n` +
                         "Ils gagneront ensemble s'ils survivent jusqu'à la fin !");
        
        startNight();
    }

    async function startNight() {
        gameState.dayNumber++;
        gameState.phase = "NIGHT";
        gameState.votes = {};
        
        const nightEmbed = new EmbedBuilder()
            .setColor(Colors.DarkBlue)
            .setTitle(`🌙 Nuit ${gameState.dayNumber}`)
            .setDescription("Tout le monde dort... Les rôles nocturnes se réveillent !");

        await channel.send({ embeds: [nightEmbed] });

        // Gérer les actions nocturnes dans l'ordre
        await handleVoyanteAction();
        await handleLoupsAction();
        await handleSorciereAction();

        // Fin de la nuit après délai
        setTimeout(resolveNight, GAME_CONFIG.NIGHT_DURATION);
    }

    async function handleVoyanteAction() {
        const voyante = gameState.players.find(p => p.alive && p.role.id === ROLES.VOYANTE.id);
        if (!voyante) return;

        // Envoyer un message privé à la voyante pour choisir une cible
        try {
            const target = await getPlayerSelection(voyante, "🔮 Choisissez un joueur à espionner");
            if (target) {
                await voyante.send(`🔮 ${target.username} est un ${target.role.name} ${target.role.emoji}`);
                gameState.eventsLog.push(`La Voyante a espionné ${target.username}`);
            }
        } catch (error) {
            console.error("Voyante action failed:", error);
        }
    }

    async function handleLoupsAction() {
        const loups = gameState.players.filter(p => p.alive && p.role.team === "LOUPS");
        if (loups.length === 0) return;
    
        // Créer un embed pour annoncer le vote
        const embed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setTitle("🐺 Réunion des Loups-Garous")
            .setDescription(`Les loups se réveillent et doivent choisir une victime (30 secondes)\nLoups: ${loups.map(l => l.username).join(', ')}`);
    
        // Créer le menu de sélection des victimes potentielles (villageois vivants)
        const potentialVictims = gameState.players.filter(p => p.alive && p.role.team === "VILLAGE");
        
        if (potentialVictims.length === 0) {
            await channel.send("Aucune victime possible ce soir...");
            return;
        }
    
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('loup_vote')
            .setPlaceholder('Choisissez une victime')
            .addOptions(
                potentialVictims.map(p => ({
                    label: p.username,
                    value: p.userID,
                    emoji: '😨'
                }))
            );
    
        const actionRow = new ActionRowBuilder().addComponents(selectMenu);
    
        // Envoyer le message de vote dans le channel (visible seulement aux loups)
        const voteMessage = await channel.send({
            content: loups.map(l => `<@${l.userID}>`).join(' '),
            embeds: [embed],
            components: [actionRow]
        });
    
        // Collecter les votes
        const votes = {};
        const collector = voteMessage.createMessageComponentCollector({
            filter: i => loups.some(l => l.userID === i.user.id),
            time: 30000
        });
    
        collector.on('collect', async interaction => {
            const voter = loups.find(l => l.userID === interaction.user.id);
            if (!voter) {
                await interaction.reply({ content: "❌ Vous n'êtes pas un loup-garou!", ephemeral: true });
                return;
            }
    
            const selectedVictimId = interaction.values[0];
            votes[interaction.user.id] = selectedVictimId;
    
            await interaction.reply({
                content: `✅ Vous avez voté pour ${gameState.players.find(p => p.userID === selectedVictimId).username}`,
                ephemeral: true
            });
        });
    
        collector.on('end', async collected => {
            await voteMessage.delete();
    
            // Compter les votes
            const voteCount = {};
            Object.values(votes).forEach(victimId => {
                voteCount[victimId] = (voteCount[victimId] || 0) + 1;
            });
    
            // Trouver la victime avec le plus de votes
            let maxVotes = 0;
            let selectedVictim = null;
    
            for (const [victimId, count] of Object.entries(voteCount)) {
                if (count > maxVotes) {
                    maxVotes = count;
                    selectedVictim = gameState.players.find(p => p.userID === victimId);
                }
            }
    
            // En cas d'égalité, choisir aléatoirement parmi les ex-aequo
            const tiedVictims = Object.entries(voteCount)
                .filter(([_, count]) => count === maxVotes)
                .map(([id]) => gameState.players.find(p => p.userID === id));
    
            if (tiedVictims.length > 1) {
                selectedVictim = tiedVictims[Math.floor(Math.random() * tiedVictims.length)];
                await channel.send("🐺 Égalité! Le choix a été fait au hasard parmi les ex-aequo.");
            }
    
            // Stocker la victime sélectionnée
            if (selectedVictim) {
                gameState.victim = selectedVictim;
                gameState.eventsLog.push(`Les Loups ont choisi ${selectedVictim.username} comme victime`);
                
                // Envoyer un message aux loups pour confirmer
                const loupChat = gameState.players
                    .filter(p => p.alive && p.role.team === "LOUPS")
                    .map(p => p.userID);
                
                await channel.send({
                    content: loupChat.map(id => `<@${id}>`).join(' '),
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colors.Red)
                            .setTitle("🐺 Décision des Loups")
                            .setDescription(`Vous avez choisi de dévorer ${selectedVictim.username} cette nuit!`)
                    ]
                });
            } else {
                await channel.send("🐺 Les loups n'ont pas pu se mettre d'accord ce soir...");
            }
        });
    }

    async function handleSorciereAction() {
        const sorciere = gameState.players.find(p => p.alive && p.role.id === ROLES.SORCIERE.id);
        if (!sorciere || !gameState.victim) return;

        // Envoyer un message privé à la sorcière avec les options
        try {
            const action = await getWitchAction(sorciere);
            if (action === 'heal' && gameState.witch.healPotion) {
                gameState.victim.protected = true;
                gameState.witch.healPotion = false;
                gameState.eventsLog.push(`La Sorcière a sauvé ${gameState.victim.username}`);
            } else if (action === 'kill' && gameState.witch.killPotion) {
                const target = await getPlayerSelection(sorciere, "🧪 Choisissez un joueur à empoisonner");
                if (target) {
                    target.alive = false;
                    gameState.witch.killPotion = false;
                    gameState.eventsLog.push(`La Sorcière a tué ${target.username}`);
                }
            }
        } catch (error) {
            console.error("Sorciere action failed:", error);
        }
    }

    async function resolveNight() {
        // Appliquer les actions de la nuit
        if (gameState.victim && !gameState.victim.protected) {
            gameState.victim.alive = false;
            await channel.send(`☠️ ${gameState.victim.username} a été dévoré par les Loups-Garous ! (Rôle: ${gameState.victim.role.name})`);
        }

        // Vérifier si la partie est terminée
        if (checkGameEnd()) return;

        // Passer au jour
        await startDay();
    }

    async function startDay() {
        gameState.phase = "DAY";
        gameState.votes = {};
        
        const dayEmbed = new EmbedBuilder()
            .setColor(Colors.Gold)
            .setTitle(`☀️ Jour ${gameState.dayNumber}`)
            .setDescription("Le village se réveille et discute...")
            .addFields(
                { name: 'Événements', value: gameState.eventsLog.join('\n') || "Rien à signaler" }
            );

        await channel.send({ embeds: [dayEmbed] });
        gameState.eventsLog = [];

        // Lancement du vote après délai
        setTimeout(startVote, GAME_CONFIG.DAY_DURATION);
    }

    async function startVote() {
        const alivePlayers = gameState.players.filter(p => p.alive);
        
        // Créer les boutons de vote
        const row = new ActionRowBuilder();
        alivePlayers.forEach(player => {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`vote_${player.userID}`)
                    .setLabel(player.username)
                    .setStyle(ButtonStyle.Primary)
            );
        });

        const voteMessage = await channel.send({
            content: "🗳 **Votez pour éliminer un joueur !** (30 secondes)",
            components: [row]
        });

        const collector = voteMessage.createMessageComponentCollector({ 
            time: GAME_CONFIG.VOTE_DURATION 
        });

        collector.on('collect', async interaction => {
            const voter = gameState.players.find(p => p.userID === interaction.user.id);
            if (!voter || !voter.alive) {
                await interaction.reply({ content: "❌ Vous ne pouvez pas voter !", ephemeral: true });
                return;
            }
            
            const targetId = interaction.customId.split('_')[1];
            gameState.votes[voter.userID] = targetId;
            
            await interaction.reply({ 
                content: `✅ Vous avez voté contre ${gameState.players.find(p => p.userID === targetId).username}`, 
                ephemeral: true 
            });
        });

        collector.on('end', async () => {
            await voteMessage.delete();
            await resolveVote();
        });
    }

    async function resolveVote() {
        // Compter les votes
        const voteCount = {};
        Object.values(gameState.votes).forEach(targetId => {
            voteCount[targetId] = (voteCount[targetId] || 0) + 1;
        });
        
        // Trouver le plus voté
        let maxVotes = 0;
        let eliminated = null;
        
        for (const [playerId, count] of Object.entries(voteCount)) {
            if (count > maxVotes) {
                maxVotes = count;
                eliminated = gameState.players.find(p => p.userID === playerId);
            }
        }
        
        // Appliquer l'élimination
        if (eliminated) {
            eliminated.alive = false;
            await channel.send(`⚰️ ${eliminated.username} a été éliminé par le village ! (Rôle: ${eliminated.role.name})`);
            
            // Gérer le chasseur
            if (eliminated.role.id === ROLES.CHASSEUR.id) {
                const target = await getPlayerSelection(eliminated, "🏹 Choisissez un joueur à emmener avec vous");
                if (target) {
                    target.alive = false;
                    await channel.send(`🏹 ${eliminated.username} (Chasseur) a emmené ${target.username} avec lui !`);
                }
            }
        } else {
            await channel.send("🤷 Aucun joueur n'a été éliminé aujourd'hui.");
        }
        
        // Vérifier si la partie est terminée
        if (checkGameEnd()) return;
        
        // Passer à la nuit suivante
        await startNight();
    }

    function checkGameEnd() {
        const alivePlayers = gameState.players.filter(p => p.alive);
        const loups = alivePlayers.filter(p => p.role.team === "LOUPS");
        const villageois = alivePlayers.filter(p => p.role.team === "VILLAGE");
        const loversAlive = gameState.lovers.filter(l => l.alive);
        
        // Vérifier les amoureux
        if (loversAlive.length === 2) {
            const sameTeam = loversAlive[0].role.team === loversAlive[1].role.team;
            endGame(sameTeam ? loversAlive[0].role.team : "AMOUREUX");
            return true;
        }
        
        // Vérifier les loups
        if (loups.length === 0) {
            endGame("VILLAGE");
            return true;
        }
        
        // Vérifier les villageois
        if (loups.length >= villageois.length) {
            endGame("LOUPS");
            return true;
        }
        
        return false;
    }

    async function endGame(winner) {
        gameState.gameActive = false;
        
        // Créer l'embed de fin
        const winnerName = winner === "AMOUREUX" ? "Les Amoureux" : 
                          winner === "VILLAGE" ? "Les Villageois" : "Les Loups-Garous";
        
        const endEmbed = new EmbedBuilder()
            .setColor(winner === "LOUPS" ? Colors.Red : Colors.Green)
            .setTitle(`🏆 ${winnerName} ont gagné !`)
            .setDescription("Fin de la partie - Rôles des joueurs :")
            .addFields(
                gameState.players.map(p => ({
                    name: `${p.username} ${p.lover ? '❤️' : ''} ${p.alive ? '🏅' : '💀'}`,
                    value: `${p.role.name} ${p.role.emoji}`,
                    inline: true
                }))
            );

        await channel.send({ embeds: [endEmbed] });

        // Mettre à jour les stats des joueurs
        for (const player of gameState.players) {
            const isWinner = 
                (winner === "AMOUREUX" && player.lover) ||
                (winner === "VILLAGE" && player.role.team === "VILLAGE" && !player.lover) ||
                (winner === "LOUPS" && player.role.team === "LOUPS" && !player.lover);
            
            await Tables.UpdateUserStats(
                player.userID, 
                isWinner, 
                isWinner ? 200 : 50, 
                isWinner ? 75 : 25
            );
        }
        
        await Tables.EndGameTable(gameHost, gameTable, guild);
    }

    // Fonctions utilitaires (à implémenter selon votre système)
    async function getPlayerSelection(player, prompt) {
        try {
            // Filtrer les joueurs vivants (sauf pour certaines actions comme la sorcière qui peut cibler des morts)
            const alivePlayers = gameState.players.filter(p => p.alive);
            
            // Créer un menu déroulant avec les joueurs disponibles
            const selectMenu = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('player_selection')
                    .setPlaceholder(prompt)
                    .addOptions(
                        alivePlayers.map(p => ({
                            label: p.username,
                            value: p.userID,
                            emoji: p.role.emoji
                        }))
            ));
    
            // Envoyer le menu en DM
            const message = await player.send({
                content: prompt,
                components: [selectMenu]
            });
    
            // Attendre la sélection
            const response = await message.awaitMessageComponent({
                filter: i => i.user.id === player.userID,
                time: 30000 // 30 secondes pour répondre
            });
    
            await response.deferUpdate();
            await message.delete();
    
            // Retourner le joueur sélectionné
            const selectedPlayer = gameState.players.find(p => p.userID === response.values[0]);
            return selectedPlayer;
    
        } catch (error) {
            if (error.code === 'InteractionCollectorError') {
                await player.send("⏱ Temps écoulé, aucune sélection n'a été faite.");
            } else {
                console.error("Erreur dans getPlayerSelection:", error);
                await channel.send(`❌ Une erreur est survenue avec ${player.username} pendant la sélection.`);
            }
            return null;
        }
    }
    
    async function getWitchAction(player) {
        try {
            // Créer les boutons pour les actions de la sorcière
            const actionRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('witch_heal')
                    .setLabel('Sauver la victime')
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(!gameState.witch.healPotion),
                new ButtonBuilder()
                    .setCustomId('witch_kill')
                    .setLabel('Tuer un joueur')
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(!gameState.witch.killPotion),
                new ButtonBuilder()
                    .setCustomId('witch_nothing')
                    .setLabel('Ne rien faire')
                    .setStyle(ButtonStyle.Secondary)
            );
    
            // Envoyer les boutons en DM
            const message = await player.send({
                content: "🧪 **Sorcière, que souhaitez-vous faire ?**\n" +
                        (gameState.witch.healPotion ? "• Potion de vie disponible\n" : "") +
                        (gameState.witch.killPotion ? "• Potion de mort disponible\n" : ""),
                components: [actionRow]
            });
    
            // Attendre la réponse
            const response = await message.awaitMessageComponent({
                filter: i => i.user.id === player.userID,
                time: 30000 // 30 secondes pour répondre
            });
    
            await response.deferUpdate();
            await message.delete();
    
            // Retourner l'action choisie
            return response.customId.split('_')[1]; // 'heal', 'kill' ou 'nothing'
    
        } catch (error) {
            if (error.code === 'InteractionCollectorError') {
                await player.send("⏱ Temps écoulé, vous n'avez rien fait.");
            } else {
                console.error("Erreur dans getWitchAction:", error);
                await channel.send(`❌ La sorcière ${player.username} n'a pas pu choisir.`);
            }
            return 'nothing';
        }
    }
}

module.exports = playWerewolf;