const { createCanvas } = require('canvas');
const Utils = require('../../Utils');

const SlotMachineRenderer = async (interaction, options) => {
    // Configuration des dimensions
    const CANVAS_WIDTH = 900;
    const CANVAS_HEIGHT = 500;
    const REEL_WIDTH = 140;
    const REEL_HEIGHT = 285;
    const SYMBOL_SIZE = 70; // Réduit pour mieux s'adapter
    const MARGIN = 30;
    const LINE_SPACING = 20;
    const CELL_PADDING = 12; // Augmenté pour plus d'espace interne

    // Valeurs par défaut pour les options
    const { 
        reels = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], 
        bet = 0, 
        winAmount = 0,
        spinning = false,
        symbols = ['🍒', '🍋', '🍊', '🍇', '🔔', '⭐', '7️⃣', '💰']
    } = options;

    const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    const ctx = canvas.getContext('2d');

    // Style de la machine
    const machineStyle = {
        casing: '#d32f2f',
        panel: '#212121',
        accent: '#ffeb3b',
        screen: '#0d47a1',
        button: '#e53935',
        grid: {
            background: '#333333',
            lineColor: 'rgba(255, 255, 255, 0.3)',
            cellPadding: CELL_PADDING,
            cornerRadius: 8
        }
    };

    // Dessin de la machine
    const drawMachine = () => {
        // Fond de table avec dégradé
        const tableGradient = ctx.createRadialGradient(
            CANVAS_WIDTH/2, CANVAS_HEIGHT/2, 0,
            CANVAS_WIDTH/2, CANVAS_HEIGHT/2, CANVAS_WIDTH/2
        );
        tableGradient.addColorStop(0, '#0a5220');
        tableGradient.addColorStop(1, '#063a16');
        ctx.fillStyle = tableGradient;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Bordure métallique
        ctx.strokeStyle = '#5d4037';
        ctx.lineWidth = 20;
        ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    };

    // Dessin des rouleaux avec ajustements précis
    const drawReels = () => {
        const startX = (CANVAS_WIDTH - (3 * REEL_WIDTH + 2 * MARGIN)) / 2;
        const emojiFonts = '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
        const symbolFont = `bold ${SYMBOL_SIZE - 15}px ${emojiFonts}`; // Taille réduite
        const symbolYStart = 120; // Ajustement vertical

        for (let i = 0; i < 3; i++) {
            const reelX = startX + i * (REEL_WIDTH + MARGIN);
            
            // Cadre du rouleau avec ombre directionnelle
            ctx.fillStyle = '#1a1a1a';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = i === 1 ? 0 : (i === 0 ? -5 : 5); // Ombre directionnelle
            ctx.shadowOffsetY = 5;
            ctx.beginPath();
            ctx.roundRect(reelX, 110, REEL_WIDTH, REEL_HEIGHT, 12);
            ctx.fill();
            ctx.shadowColor = 'transparent';
            
            // Fond gris pour toutes les cellules
            const cellHeight = SYMBOL_SIZE + LINE_SPACING - 5;
            for (let j = 0; j < 3; j++) {
                const cellY = symbolYStart + j * (SYMBOL_SIZE + LINE_SPACING);
                
                ctx.fillStyle = machineStyle.grid.background;
                ctx.beginPath();
                ctx.roundRect(
                    reelX + machineStyle.grid.cellPadding,
                    cellY,
                    REEL_WIDTH - (machineStyle.grid.cellPadding * 2),
                    cellHeight,
                    machineStyle.grid.cornerRadius
                );
                ctx.fill();
            }

            // Lignes de séparation plus fines
            ctx.strokeStyle = machineStyle.grid.lineColor;
            ctx.lineWidth = 1;
            for (let j = 1; j < 3; j++) {
                const lineY = symbolYStart + (j * (SYMBOL_SIZE + LINE_SPACING)) - 2.3;
                ctx.beginPath();
                ctx.moveTo(reelX + machineStyle.grid.cellPadding, lineY);
                ctx.lineTo(reelX + REEL_WIDTH - machineStyle.grid.cellPadding, lineY);
                ctx.stroke();
            }

            // Symboles parfaitement centrés
            for (let j = 0; j < 3; j++) {
                const symbolY = symbolYStart + j * (SYMBOL_SIZE + LINE_SPACING) + (cellHeight / 2);
                const symbolIndex = reels[i][j];
                
                if (spinning && Math.random() > 0.3) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                    ctx.beginPath();
                    ctx.roundRect(
                        reelX + (REEL_WIDTH - SYMBOL_SIZE) / 2,
                        symbolY - SYMBOL_SIZE/2,
                        SYMBOL_SIZE,
                        SYMBOL_SIZE,
                        5
                    );
                    ctx.fill();
                    continue;
                }
                
                const symbol = symbols[symbolIndex];
                if (!symbol) continue;

                // Style optimisé pour les emojis
                ctx.fillStyle = '#ffffff';
                ctx.font = symbolFont;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // Ombre légère et précise
                ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                ctx.shadowBlur = 3;
                ctx.shadowOffsetY = 2;
                
                // Positionnement précis dans la cellule
                ctx.fillText(
                    symbol,
                    reelX + REEL_WIDTH / 2,
                    symbolY
                );
                
                ctx.shadowColor = 'transparent';
            }
        }
    };

      const drawInfo = () => {
        // Titre stylisé
        ctx.fillStyle = '#ffd700';
        ctx.font = "bold 32px 'Arial', sans-serif";
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 5;
        ctx.fillText('🎰 SLOT MACHINE 🎰', CANVAS_WIDTH/2, 40);
        ctx.shadowColor = 'transparent';
        
        // Mise
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
        ctx.fillText(betText, CANVAS_WIDTH - 30, CANVAS_HEIGHT - 32); // Marge de 10px à droite
        ctx.textAlign = 'left';
        
        // Gains
        if (winAmount > 0) {
            ctx.fillStyle = '#2ecc71';
            ctx.font = 'bold 28px Arial';
            ctx.fillText(`GAIN: ${Utils.formatMoney(winAmount)} €`, CANVAS_WIDTH - 40, 150);
        }
    };

    // Dessin du bouton SPIN
    const drawButton = () => {
        // Bouton principal
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
        
        // Texte du bouton
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SPIN', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 58);
    };

    // Effet de gain amélioré
    const drawWinEffect = () => {
        if (winAmount <= 0) return;
        
        // Effet de particules dorées
        
        // Texte de gain
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 10;
        ctx.fillText('GAGNÉ!', CANVAS_WIDTH / 2, 80);
        ctx.shadowColor = 'transparent';
    };

    try {
        // Double la résolution pour un meilleur rendu
        canvas.width = CANVAS_WIDTH * 2;
        canvas.height = CANVAS_HEIGHT * 2;
        ctx.scale(2, 2);

        drawMachine();
        drawReels();
        drawInfo();
        drawButton();
        drawWinEffect();

        return canvas;
    } catch (error) {
        console.error('Erreur dans le renderer slot machine:', error);
        throw new Error('Échec du rendu de la machine à sous');
    }
};

module.exports = SlotMachineRenderer;