// games/WordsBattle.js
const { EmbedBuilder, Colors } = require('discord.js');

const GAME_CONFIG = {
    START_DELAY: 10000,       // 10 secondes
    GAME_DURATION: 600000,    // 10 minutes
    MAX_ERRORS: 3,            // Nombre d'erreurs avant élimination
    WORD_TIMEOUT: 30000,      // 30 secondes pour répondre
    MIN_WORD_LENGTH: 3,       // Longueur minimale des mots
    BONUS_XP_PER_WORD: 5,     // XP par mot valide
    BONUS_COINS_PER_WORD: 2   // Pièces par mot valide
};

class WordsBattleGame {
    constructor(channel, gameHost, gameTable, guild) {
        this.channel = channel;
        this.gameHost = gameHost;
        this.guild = guild;
        
        this.players = gameTable.map(member => ({
            id: member.userID,
            name: `<@${member.userID}>`,
            score: 0,
            errors: 0,
            eliminated: false,
            lastActivity: Date.now()
        }));
        
        this.usedWords = new Set();
        this.lastWord = "";
        this.currentPlayerIndex = 0;
        this.gameActive = true;
        this.collector = null;
        this.turnTimeout = null;
    }

    async startGame() {
        await this.sendStartMessage();
        await new Promise(resolve => setTimeout(resolve, GAME_CONFIG.START_DELAY));
        this.startRound();
    }

    async sendStartMessage() {
        const embed = new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle('🧠 Words Battle')
            .setDescription('Trouvez des mots commençant par la dernière lettre du mot précédent!')
            .addFields(
                { name: 'Règles', value: `- 3 erreurs = élimination\n- Min ${GAME_CONFIG.MIN_WORD_LENGTH} lettres\n- Pas de répétition` },
                { name: 'Durée', value: `${GAME_CONFIG.GAME_DURATION/60000} minutes` },
                { name: 'Joueurs', value: this.players.map(p => p.name).join('\n') }
            );

        await this.channel.send({
            content: `${this.players.map(p => p.name).join(', ')} Prêts pour le duel de mots ?`,
            embeds: [embed]
        });
    }

    startRound() {
        if (!this.gameActive) return;

        const currentPlayer = this.getCurrentPlayer();
        this.channel.send(`À ${currentPlayer.name} de jouer ! **(${this.getCurrentLetter()})**`);

        // Timeout pour le tour
        this.turnTimeout = setTimeout(() => this.handlePlayerTimeout(), GAME_CONFIG.WORD_TIMEOUT);

        // Configuration du collector
        this.collector = this.channel.createMessageCollector({
            filter: m => this.isPlayerActive(m.author.id),
            time: GAME_CONFIG.WORD_TIMEOUT
        });

        this.collector.on('collect', m => this.handlePlayerMessage(m));
        this.collector.on('end', () => this.collector = null);
    }

    async handlePlayerMessage(message) {
        const player = this.getPlayer(message.author.id);
        if (!player || message.author.id !== this.getCurrentPlayer().id) {
            return message.reply("Ce n'est pas votre tour !").then(msg => setTimeout(() => msg.delete(), 3000));
        }

        player.lastActivity = Date.now();
        const word = message.content.trim().toLowerCase();

        if (!this.isValidWord(word)) {
            return this.handleInvalidWord(player, message);
        }

        // Mot valide
        clearTimeout(this.turnTimeout);
        if (this.collector) this.collector.stop();

        this.registerValidWord(player, word);
        this.nextTurn();
    }

    handlePlayerTimeout() {
        const player = this.getCurrentPlayer();
        player.errors++;
        
        this.channel.send(`${player.name} n'a pas répondu à temps ! (Erreur ${player.errors}/${GAME_CONFIG.MAX_ERRORS})`);
        this.checkPlayerElimination(player);
    }

    handleInvalidWord(player, message) {
        player.errors++;
        const errorMsg = this.getInvalidWordMessage(message.content);

        message.reply(errorMsg).then(msg => setTimeout(() => msg.delete(), 5000));
        this.checkPlayerElimination(player);
    }

    getInvalidWordMessage(word) {
        if (word.length < GAME_CONFIG.MIN_WORD_LENGTH) {
            return `Mot trop court ! Minimum ${GAME_CONFIG.MIN_WORD_LENGTH} lettres.`;
        }
        
        if (!/^[a-zA-Z]+$/.test(word)) {
            return "Seules les lettres sont autorisées !";
        }
        
        if (this.usedWords.has(word.toLowerCase())) {
            return "Ce mot a déjà été utilisé !";
        }
        
        if (this.lastWord && word[0] !== this.lastWord.slice(-1)) {
            return `Le mot doit commencer par "${this.lastWord.slice(-1).toUpperCase()}" !`;
        }
        
        return "Mot invalide !";
    }

    checkPlayerElimination(player) {
        if (player.errors >= GAME_CONFIG.MAX_ERRORS) {
            player.eliminated = true;
            this.channel.send(`❌ ${player.name} est éliminé !`);

            if (this.getActivePlayers().length <= 1) {
                this.endGame(this.getActivePlayers()[0]);
            } else {
                this.nextTurn();
            }
        } else {
            this.nextTurn();
        }
    }

    registerValidWord(player, word) {
        this.usedWords.add(word);
        this.lastWord = word;
        player.score++;
        
        this.channel.send(`✅ ${player.name} : "${word.toUpperCase()}" (Score: ${player.score})`);
    }

    nextTurn() {
        if (!this.gameActive) return;

        do {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        } while (this.getCurrentPlayer().eliminated);

        this.startRound();
    }

    async endGame(winner) {
        this.gameActive = false;
        clearTimeout(this.turnTimeout);
        if (this.collector) this.collector.stop();

        if (winner) {
            const xp = GAME_CONFIG.BONUS_XP_PER_WORD * winner.score + 50;
            const coins = GAME_CONFIG.BONUS_COINS_PER_WORD * winner.score + 100;

            const embed = new EmbedBuilder()
                .setColor(Colors.Green)
                .setTitle('🏆 Victoire !')
                .setDescription(`${winner.name} remporte la partie avec ${winner.score} mots !`)
                .addFields(
                    { name: 'Score', value: winner.score.toString(), inline: true },
                    { name: 'Récompense', value: `${xp} XP | ${coins} pièces`, inline: true }
                );

            await this.channel.send({ embeds: [embed] });
            await UpdateUserStats(winner.id, true, xp, coins);

            // Récompenses pour les autres joueurs
            for (const player of this.players.filter(p => p.id !== winner.id)) {
                const loserXp = Math.floor(GAME_CONFIG.BONUS_XP_PER_WORD * player.score / 2);
                const loserCoins = Math.floor(GAME_CONFIG.BONUS_COINS_PER_WORD * player.score / 2);
                await UpdateUserStats(player.id, false, loserXp, loserCoins);
            }
        } else {
            // Égalité ou temps écoulé
            const embed = new EmbedBuilder()
                .setColor(Colors.Orange)
                .setTitle('⏳ Temps écoulé')
                .setDescription('La partie se termine sans vainqueur !')
                .addFields(
                    ...this.players.map(p => ({
                        name: p.name,
                        value: `${p.score} mots`,
                        inline: true
                    }))
                );

            await this.channel.send({ embeds: [embed] });

            // Récompenses pour tous les joueurs
            for (const player of this.players) {
                const xp = GAME_CONFIG.BONUS_XP_PER_WORD * player.score;
                const coins = GAME_CONFIG.BONUS_COINS_PER_WORD * player.score;
                await UpdateUserStats(player.id, null, xp, coins);
            }
        }

        await EndGameTable(this.gameHost, this.players.map(p => ({ userID: p.id })), this.guild);
    }

    isValidWord(word) {
        return (
            word.length >= GAME_CONFIG.MIN_WORD_LENGTH &&
            /^[a-zA-Z]+$/.test(word) &&
            !this.usedWords.has(word.toLowerCase()) &&
            (!this.lastWord || word[0].toLowerCase() === this.lastWord.slice(-1).toLowerCase())
        );
    }

    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    getPlayer(id) {
        return this.players.find(p => p.id === id);
    }

    getActivePlayers() {
        return this.players.filter(p => !p.eliminated);
    }

    isPlayerActive(id) {
        const player = this.getPlayer(id);
        return player && !player.eliminated;
    }

    getCurrentLetter() {
        return this.lastWord ? this.lastWord.slice(-1).toUpperCase() : 'n\'importe quelle lettre';
    }
}

async function playWordsBattle(channel, gameHost, gameTable, guild) {
    const game = new WordsBattleGame(channel, gameHost, gameTable, guild);
    await game.startGame();
}

module.exports = playWordsBattle;