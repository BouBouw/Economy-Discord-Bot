const { createCanvas } = require('canvas');
const Utils = require('../../Utils');

const DiceRenderer = async (interaction, options) => {
    const CANVAS_WIDTH = 900;
    const CANVAS_HEIGHT = 500;
    
    const { 
        bet = 0,
        diceValue = 1,
        winAmount = null,
        rolling = false
    } = options;

    const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    const ctx = canvas.getContext('2d');

    // Double la résolution pour un meilleur rendu
    canvas.width = CANVAS_WIDTH * 2;
    canvas.height = CANVAS_HEIGHT * 2;
    ctx.scale(2, 2);

    const drawBackground = () => {
        const gradient = ctx.createRadialGradient(
            CANVAS_WIDTH/2, CANVAS_HEIGHT/2, 0,
            CANVAS_WIDTH/2, CANVAS_HEIGHT/2, CANVAS_WIDTH/2
        );
        gradient.addColorStop(0, '#0a5220');
        gradient.addColorStop(1, '#063a16');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        ctx.strokeStyle = '#5d4037';
        ctx.lineWidth = 20;
        ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    };

    const draw3DDice = () => {
        const diceSize = 120;
        const diceX = CANVAS_WIDTH / 2 - diceSize / 2;
        const diceY = CANVAS_HEIGHT / 2 - diceSize / 2;
        
        // Effet de roulement
        if (rolling) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.roundRect(diceX, diceY, diceSize, diceSize, 15);
            ctx.fill();
            return;
        }
        
        // Base du dé (carré 3D)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(diceX, diceY, diceSize, diceSize, 15);
        ctx.fill();
        
        // Ombre 3D
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 8;
        ctx.stroke();
        
        // Bordure noire
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Points du dé (style casino)
        ctx.fillStyle = '#000000';
        const dotPositions = {
            1: [[0.5, 0.5]],
            2: [[0.25, 0.25], [0.75, 0.75]],
            3: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]],
            4: [[0.25, 0.25], [0.25, 0.75], [0.75, 0.25], [0.75, 0.75]],
            5: [[0.25, 0.25], [0.25, 0.75], [0.5, 0.5], [0.75, 0.25], [0.75, 0.75]],
            6: [[0.25, 0.2], [0.25, 0.5], [0.25, 0.8], [0.75, 0.2], [0.75, 0.5], [0.75, 0.8]]
        };

        const dotSize = diceSize * 0.15;
        dotPositions[diceValue].forEach(pos => {
            ctx.beginPath();
            ctx.arc(
                diceX + pos[0] * diceSize,
                diceY + pos[1] * diceSize,
                dotSize,
                0,
                Math.PI * 2
            );
            ctx.fill();
        });
    };

    const drawInfo = () => {
        ctx.fillStyle = '#ffd700';
        ctx.font = "bold 32px 'Arial', sans-serif";
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 5;
        ctx.fillText('🎲 JEU DE DÉS 🎲', CANVAS_WIDTH/2, 50);
        ctx.shadowColor = 'transparent';
        
        const betText = `MISE: ${Utils.formatMoney(Number(bet))} €`;
        ctx.font = "bold 24px 'Arial', sans-serif";
        const textWidth = ctx.measureText(betText).width;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.roundRect(
            CANVAS_WIDTH - textWidth - 40,
            CANVAS_HEIGHT - 50,
            textWidth + 20, 
            35, 
            5
        );
        ctx.fill();
        
        ctx.fillStyle = '#f1c40f';
        ctx.textAlign = 'right';
        ctx.fillText(betText, CANVAS_WIDTH - 30, CANVAS_HEIGHT - 25);
        ctx.textAlign = 'left';
    };

    const drawButton = () => {
        const gradient = ctx.createLinearGradient(
            CANVAS_WIDTH/2 - 50, CANVAS_HEIGHT - 80,
            CANVAS_WIDTH/2 + 50, CANVAS_HEIGHT - 40
        );
        gradient.addColorStop(0, '#e53935');
        gradient.addColorStop(1, '#c62828');
        
        ctx.fillStyle = gradient;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 5;
        ctx.beginPath();
        ctx.roundRect(
            CANVAS_WIDTH/2 - 50,
            CANVAS_HEIGHT - 80,
            100,
            40,
            20
        );
        ctx.fill();
        ctx.shadowColor = 'transparent';
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SPIN', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 54);
    };

    const drawWinEffect = () => {
        if(winAmount === null) return;
        
        if (winAmount > 0) {
            ctx.fillStyle = '#2ECC71';
            ctx.font = "bold 30px 'Arial', sans-serif";
            ctx.textAlign = 'center';
            
            // Fond semi-transparent
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.beginPath();
            ctx.roundRect(CANVAS_WIDTH/2 - 200, CANVAS_HEIGHT/2 - 25, 400, 50, 10);
            ctx.fill();
            
            // Texte du résultat
            ctx.fillStyle = '#2ECC71';
            ctx.fillText(`GAGNÉ: +${Utils.formatMoney(winAmount)} €` , CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 10);
            ctx.textAlign = 'left';
        } else {
            ctx.fillStyle = '#E74C3C';
            ctx.font = "bold 30px 'Arial', sans-serif";
            ctx.textAlign = 'center';
            
            // Fond semi-transparent
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.beginPath();
            ctx.roundRect(CANVAS_WIDTH/2 - 200, CANVAS_HEIGHT/2 - 25, 400, 50, 10);
            ctx.fill();
            
            // Texte du résultat
            ctx.fillStyle = '#E74C3C';
            ctx.fillText(`PERDU: -${Utils.formatMoney(bet)} €` , CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 10);
            ctx.textAlign = 'left';
        }
    };

    try {
        drawBackground();
        draw3DDice();
        drawInfo();
        drawButton();
        drawWinEffect();

        return canvas;
    } catch (error) {
        console.error('Erreur dans le renderer dice:', error);
        throw new Error('Échec du rendu du jeu de dés');
    }
};

module.exports = DiceRenderer;