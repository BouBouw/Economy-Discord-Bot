const { createCanvas, loadImage } = require('canvas');
const { AttachmentBuilder } = require('discord.js');
const { client } = require('../../..');

// Configuration des jeux avec toutes les données fournies
const GAME_CONFIG = {
    gameTypes: {
        0: { name: "Quizz Battle", icon: "❓", color: "#3498db", minPlayers: 2, maxPlayers: 10 },
        1: { name: "Tic-Tac-Toe", icon: "⭕", color: "#3498db", minPlayers: 2, maxPlayers: 2 },
        2: { name: "Duel de Mots", icon: "🔠", color: "#9b59b6", minPlayers: 2, maxPlayers: 4 },
        3: { name: "Course de Dés", icon: "🎲", color: "#e67e22", minPlayers: 2, maxPlayers: 8 },
        4: { name: "Codenames", icon: "🕵️", color: "#1abc9c", minPlayers: 4, maxPlayers: 12 },
        5: { name: "Loup-Garou", icon: "🐺", color: "#e74c3c", minPlayers: 5, maxPlayers: 15 },
        6: { name: "Pierre Papier Ciseaux", icon: "✂️", color: "#f1c40f", minPlayers: 2, maxPlayers: 2 },
        7: { name: "Poker", icon: "♠️", color: "#27ae60", minPlayers: 2, maxPlayers: 8 },
        8: { name: "Monopoly", icon: "🏦", color: "#d35400", minPlayers: 2, maxPlayers: 6 }
    },
    modeSizes: {
        0: 2,
        1: 4,
        2: 6,
        3: 8,
        4: 10,
        5: 12
    },
    allowedSizes: {
        0: [0, 1],       // Quizz Battle (2-4 joueurs)
        1: [0, 1],       // Tic-Tac-Toe (2-4 joueurs)
        2: [0, 1, 2, 3, 4, 5], // Duel de Mots (2-12 joueurs)
        3: [0, 1, 2, 3, 4, 5], // Course de Dés (2-12 joueurs)
        4: [0, 1, 2, 3, 4],    // Codenames (2-10 joueurs)
        5: [3, 4, 5],   // Loup-Garou (8-12 joueurs)
        6: [0],          // PPC (2 joueurs)
        7: [2, 3, 5]     // Poker (6-12 joueurs)
    }
};

async function createGameTable(channel, gameHost, gameTable, guild) {
    console.log(guild)
    try {
        // Récupération des configurations
        const gameInfo = GAME_CONFIG.gameTypes[gameHost.gameType] || GAME_CONFIG.gameTypes[0];
        const modeSize = GAME_CONFIG.modeSizes[gameHost.gameMode] || 2;
        const allowedModes = GAME_CONFIG.allowedSizes[gameHost.gameType] || [];
        const isSizeValid = allowedModes.includes(gameHost.gameMode);
        
        // Dimensions dynamiques
        const rowHeight = 90;
        const baseHeight = 400;
        const canvasHeight = Math.min(1400, baseHeight + (gameTable.length * rowHeight));
        const canvasWidth = 1100;

        // Création du canvas HD
        const canvas = createCanvas(canvasWidth, canvasHeight);
        const ctx = canvas.getContext('2d');
        canvas.width = canvasWidth * 2;
        canvas.height = canvasHeight * 2;
        ctx.scale(2, 2);

        // Arrière-plan thématique
        const bgGradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
        bgGradient.addColorStop(0, darkenColor(gameInfo.color, 30));
        bgGradient.addColorStop(1, darkenColor(gameInfo.color, 50));
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Cadre décoratif
        ctx.strokeStyle = lightenColor(gameInfo.color, 20);
        ctx.lineWidth = 20;
        ctx.strokeRect(10, 10, canvasWidth - 20, canvasHeight - 20);
        
        // Icône et nom du jeu
        ctx.font = 'bold 48px "Segoe UI"';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(`${gameInfo.name}`, canvasWidth / 2, 80);

        // Mode et taille de partie
        ctx.font = '28px "Segoe UI"';
        ctx.fillText(`Mode: ${modeSize} joueurs`, canvasWidth / 2, 130);

        // Nouvelle position Y pour un design plus haut
        const infoBoxY = 200;

        // Liste des joueurs
        const playersStartY = infoBoxY;
        ctx.fillStyle = lightenColor(gameInfo.color, 10);
        ctx.font = 'bold 24px "Segoe UI"';
        ctx.textAlign = 'left';
        ctx.fillText('JOUEURS', 60, playersStartY - 10);

        // En-têtes des colonnes
        ctx.fillText('STATUT', canvasWidth - 320, playersStartY - 10);
        ctx.fillText('REJOINT', canvasWidth - 165, playersStartY - 10);

        // Séparateur
        drawSeparator(ctx, 50, playersStartY + 10, canvasWidth - 50);

        // Affichage des joueurs
        for (let i = 0; i < gameTable.length; i++) {
            const player = gameTable[i];
            const yPos = playersStartY + 40 + (i * 90);

            const { user } = await client.guilds.cache.get(guild.id).members.fetch(player.userID);

            ctx.save();
            drawRoundedRect(ctx, 40, yPos - 10, canvasWidth - 80, 80, 20);
            
            // Ombre
            ctx.shadowColor = 'rgba(0,0,0,0.2)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetY = 4;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.fill();

            // Avatar
            try {
                const avatar = await loadImage(user.displayAvatarURL({ extension: 'jpg' }));
                ctx.restore();
                ctx.save();
                ctx.beginPath();
                ctx.arc(80, yPos + 30, 30, 0, Math.PI * 2);
                ctx.clip();
                ctx.drawImage(avatar, 50, yPos, 60, 60);
                ctx.restore();
            } catch {
                drawFallbackAvatar(ctx, 50, yPos, 60, player.username);
            }
            
            // Nom
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 22px "Segoe UI"';
            ctx.fillText(user.username, 130, yPos + 40);
            
            // Statut
            ctx.fillStyle = player.userID === gameHost.hostID ? '#E74C3C' : '#FFFFFF';
            ctx.font = '20px "Segoe UI"';
            ctx.fillText(
                player.userID === gameHost.hostID ? 'Hôte' : 'Joueur',
                canvasWidth - 300,
                yPos + 40
            );
            
            // Heure
            const joinTime = new Date(player.joinedAt).toLocaleTimeString();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.font = '18px "Segoe UI"';
            ctx.textAlign = 'right';
            ctx.fillText(joinTime, canvasWidth - 80, yPos + 40);
            ctx.textAlign = 'left';

            // Séparateur
            if (i < gameTable.length - 1) {
                drawSeparator(ctx, 60, yPos + 70, canvasWidth - 60, 0.2);
            }
        }

        // Conversion et envoi
        const buffer = canvas.toBuffer('image/png');
        const attachment = new AttachmentBuilder(buffer, { name: 'game-table.png' });
        await channel.send({ files: [attachment] });

    } catch (error) {
        console.error('Erreur création table de jeu:', error);
        await channel.send("❌ Une erreur est survenue lors de la création de la table de jeu.");
    }
}

// Fonctions utilitaires
function darkenColor(color, percent) {
    // Implémentation pour assombrir une couleur hex
    return adjustColor(color, -percent);
}

function lightenColor(color, percent) {
    // Implémentation pour éclaircir une couleur hex
    return adjustColor(color, percent);
}

function adjustColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + percent));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + percent));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + percent));
    return `#${(1 << 24 | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

function drawSeparator(ctx, x1, y, x2, opacity = 0.3) {
    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x2, y);
    ctx.stroke();
}

function drawFallbackAvatar(ctx, x, y, size, username) {
    // Vérification et valeur par défaut
    const displayChar = username && typeof username === 'string' && username.length > 0
        ? username.charAt(0).toUpperCase()
        : '?'; // Caractère par défaut si username est invalide

    // Dessin du cercle de fond
    ctx.fillStyle = '#34495e';
    ctx.beginPath();
    ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
    ctx.fill();

    // Texte centré
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${size/2}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle'; // Ajout pour meilleur centrage vertical
    ctx.fillText(displayChar, x + size/2, y + size/2);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic'; // Rétablir la valeur par défaut
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
}

module.exports = { createGameTable };