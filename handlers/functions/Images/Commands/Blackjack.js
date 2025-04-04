const { createCanvas } = require('canvas');
const Utils = require('../../Utils');

const BlackjackRenderer = async (interaction, options) => {
    // Configuration des dimensions
    const CARD_WIDTH = 100;
    const CARD_HEIGHT = 140;
    const CANVAS_WIDTH = 900;
    const CANVAS_HEIGHT = 500;

    // Destructuration des options
    const { 
        playerHand = [], 
        dealerHand = [], 
        bet = 0, 
        showDealerCards = false,
        gameResult = null,
        winnings = 0
    } = options;

    // Création du canvas
    const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    const ctx = canvas.getContext('2d');

    // Fonctions internes
    const calculateScore = (hand) => {
        const cardValues = {
            'A': 11, '2': 2, '3': 3, '4': 4, '5': 5,
            '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
            'J': 10, 'Q': 10, 'K': 10
        };
        
        let score = hand.reduce((acc, card) => acc + cardValues[card.rank], 0);
        let aces = hand.filter(card => card.rank === 'A').length;
        
        while (score > 21 && aces > 0) {
            score -= 10;
            aces--;
        }
        return score;
    };

    const drawCardFront = (ctx, card, x, y, shadow = true) => {
        // Ombre portée
        if (shadow) {
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(x + 5, y + 5, CARD_WIDTH, CARD_HEIGHT);
        }

        // Corps de la carte
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.roundRect(x, y, CARD_WIDTH, CARD_HEIGHT, 10);
        ctx.fill();
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Valeur et symbole
        ctx.fillStyle = ['H', 'D'].includes(card.suit) ? '#e74c3c' : '#2c3e50';
        
        // Rang en haut
        ctx.font = 'bold 24px Arial';
        ctx.fillText(card.rank, x + 10, y + 30);

        // Symbole central
        const symbols = { 'S': '♠', 'H': '♥', 'D': '♦', 'C': '♣' };
        ctx.font = '60px Arial';
        ctx.fillText(symbols[card.suit], x + CARD_WIDTH/2 - 20, y + CARD_HEIGHT/2 + 20);

        // Rang en bas (inversé) - Ajusté pour ne pas dépasser
        ctx.save();
        ctx.translate(x + CARD_WIDTH - 15, y + CARD_HEIGHT - 15); // Ajustement des coordonnées
        ctx.rotate(Math.PI);
        ctx.font = 'bold 24px Arial';
        ctx.fillText(card.rank, -3, 10); // Ajustement de la position Y
        ctx.restore();
    };

    const drawCardBack = (ctx, x, y) => {
        // Dégradé bleu
        const gradient = ctx.createLinearGradient(x, y, x + CARD_WIDTH, y + CARD_HEIGHT);
        gradient.addColorStop(0, '#1a237e');
        gradient.addColorStop(1, '#283593');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, CARD_WIDTH, CARD_HEIGHT, 10);
        ctx.fill();
        
        // Motif de carte
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                if ((i + j) % 2 === 0) {
                    ctx.beginPath();
                    ctx.arc(x + 20 + j * 20, y + 30 + i * 20, 8, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
        
        // Bordure
        ctx.strokeStyle = '#3949ab';
        ctx.lineWidth = 3;
        ctx.stroke();
    };

    const drawHand = (ctx, hand, x, y, reveal, isDealer = false) => {
        const handWidth = hand.length * (CARD_WIDTH * 0.6) + CARD_WIDTH * 0.4;
        const startX = x + (CANVAS_WIDTH - handWidth) / 2;
        
        hand.forEach((card, i) => {
            const cardX = startX + i * (CARD_WIDTH * 0.6);
            const cardY = y;
            
            if (i === 0 && !reveal && isDealer) {
                drawCardBack(ctx, cardX, cardY);
            } else {
                drawCardFront(ctx, card, cardX, cardY, i !== 0);
            }
        });
    };

    // Rendu principal
    try {
        // Fond de table (feutrine verte)
        const tableGradient = ctx.createRadialGradient(
            CANVAS_WIDTH/2, CANVAS_HEIGHT/2, 0,
            CANVAS_WIDTH/2, CANVAS_HEIGHT/2, CANVAS_WIDTH/2
        );
        tableGradient.addColorStop(0, '#0a5220');
        tableGradient.addColorStop(1, '#063a16');
        
        ctx.fillStyle = tableGradient;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Bordure de table
        ctx.strokeStyle = '#5d4037';
        ctx.lineWidth = 20;
        ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Titre
        ctx.fillStyle = '#f1c40f';
        ctx.font = "bold 28px 'Arial', sans-serif";
        ctx.textAlign = 'center';
        ctx.fillText('♠ BLACKJACK ♥', CANVAS_WIDTH/2, 40);
        ctx.textAlign = 'left';

        // Main du croupier (position remontée)
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = "bold 22px 'Arial', sans-serif";
        ctx.fillText(`CROUPIER: ${showDealerCards ? calculateScore(dealerHand) : '?'}`, 50, 70); // Texte remonté
        drawHand(ctx, dealerHand, 0, 90, showDealerCards, true); // Cartes remontées

        // Séparateur (position ajustée)
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.moveTo(50, 260); // Ligne remontée
        ctx.lineTo(CANVAS_WIDTH - 50, 260);
        ctx.stroke();
        ctx.setLineDash([]);

        // Main du joueur
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = "bold 22px 'Arial', sans-serif";
        ctx.fillText(`${interaction.user.username.toUpperCase()}: ${calculateScore(playerHand)}`, 50, 300); // Texte remonté
        drawHand(ctx, playerHand, 0, 320, true, false);

        // Mise avec rectangle et marge
        const betText = `MISE: ${Utils.formatMoney(Number(bet))} €`;
        ctx.font = "bold 24px 'Arial', sans-serif";
        const textWidth = ctx.measureText(betText).width;
        
        // Rectangle de fond avec marge
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.roundRect(
            CANVAS_WIDTH - textWidth - 40, // x avec marge droite
            CANVAS_HEIGHT - 50, // y avec marge basse
            textWidth + 20, 
            35, 
            5
        );
        ctx.fill();
        
        // Texte de la mise
        ctx.fillStyle = '#f1c40f';
        ctx.textAlign = 'right';
        ctx.fillText(betText, CANVAS_WIDTH - 30, CANVAS_HEIGHT - 25); // Marge de 10px à droite
        ctx.textAlign = 'left';

        // Résultat
        if (gameResult) {
            ctx.fillStyle = winnings > 0 ? '#2ecc71' : winnings < 0 ? '#e74c3c' : '#f1c40f';
            ctx.font = "bold 30px 'Arial', sans-serif";
            ctx.textAlign = 'center';
            
            const resultText = winnings > 0 
                ? `GAGNÉ: +${Utils.formatMoney(winnings)} €` 
                : winnings < 0 
                    ? `PERDU: ${Utils.formatMoney(winnings)} €` 
                    : `${gameResult}`;
            
            // Fond semi-transparent
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.beginPath();
            ctx.roundRect(CANVAS_WIDTH/2 - 200, CANVAS_HEIGHT/2 - 25, 400, 50, 10);
            ctx.fill();
            
            // Texte du résultat
            ctx.fillStyle = winnings > 0 ? '#2ecc71' : winnings < 0 ? '#e74c3c' : '#f1c40f';
            ctx.fillText(resultText, CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 10);
            ctx.textAlign = 'left';
        }

        return {
            canvas,
            playerScore: calculateScore(playerHand),
            dealerScore: showDealerCards ? calculateScore(dealerHand) : null
        };

    } catch (error) {
        console.error('Erreur dans le renderer:', error);
        throw new Error('Échec du rendu du blackjack');
    }
};

module.exports = BlackjackRenderer;