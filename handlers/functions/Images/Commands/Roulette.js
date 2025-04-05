const { createCanvas, loadImage } = require('canvas');
const Utils = require('../../Utils');

const RouletteRenderer = async (interaction, options) => {
    const CANVAS_WIDTH = 900;
    const CANVAS_HEIGHT = 500;
    
    const { 
        bet = 0,
        winAmount = null,
        winningNumber = null,
        spinning = false,
        bets = []
    } = options;

    const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    const ctx = canvas.getContext('2d');

    canvas.width = CANVAS_WIDTH * 2;
    canvas.height = CANVAS_HEIGHT * 2;
    ctx.scale(2, 2);

    // Ordre correct des nombres sur une roulette européenne avec leurs couleurs exactes
    const wheelOrder = [
        { number: 0, color: '#00aa00' },
        { number: 32, color: '#ff0000' },
        { number: 15, color: '#000000' },
        { number: 19, color: '#ff0000' },
        { number: 4, color: '#000000' },
        { number: 21, color: '#ff0000' },
        { number: 2, color: '#000000' },
        { number: 25, color: '#ff0000' },
        { number: 17, color: '#000000' },
        { number: 34, color: '#ff0000' },
        { number: 6, color: '#000000' },
        { number: 27, color: '#ff0000' },
        { number: 13, color: '#000000' },
        { number: 36, color: '#ff0000' },
        { number: 11, color: '#000000' },
        { number: 30, color: '#ff0000' },
        { number: 8, color: '#000000' },
        { number: 23, color: '#ff0000' },
        { number: 10, color: '#000000' },
        { number: 5, color: '#ff0000' },
        { number: 24, color: '#000000' },
        { number: 16, color: '#ff0000' },
        { number: 33, color: '#000000' },
        { number: 1, color: '#ff0000' },
        { number: 20, color: '#000000' },
        { number: 14, color: '#ff0000' },
        { number: 31, color: '#000000' },
        { number: 9, color: '#ff0000' },
        { number: 22, color: '#000000' },
        { number: 18, color: '#ff0000' },
        { number: 29, color: '#000000' },
        { number: 7, color: '#ff0000' },
        { number: 28, color: '#000000' },
        { number: 12, color: '#ff0000' },
        { number: 35, color: '#000000' },
        { number: 3, color: '#ff0000' },
        { number: 26, color: '#000000' }
    ];

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

    const drawWheel = () => {
        const centerX = CANVAS_WIDTH / 2;
        const centerY = (CANVAS_HEIGHT / 2) - 10;
        const radius = 180;
    
        // Roue extérieure
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = '#333333';
        ctx.fill();
        ctx.strokeStyle = '#ffeb3b';
        ctx.lineWidth = 5;
        ctx.stroke();
    
        // Nombres de la roulette
        if (!spinning) {
            const angleStep = (Math.PI * 2) / wheelOrder.length;
            
            wheelOrder.forEach((item, i) => {
                const angle = i * angleStep - Math.PI/2;
                const numRadius = radius - 40;
                
                // Segment coloré avec contour
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius - 20, angle, angle + angleStep, false);
                ctx.closePath();
                ctx.fillStyle = item.color;
                ctx.fill();
                
                // Contour entre les segments
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.stroke();
                
                // Position du numéro
                const x = centerX + Math.cos(angle + angleStep/2) * (numRadius);
                const y = centerY + Math.sin(angle + angleStep/2) * (numRadius);
                
                // Numéro avec rotation correcte
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(angle + angleStep/2 + Math.PI/2);
                ctx.fillStyle = item.color === '#000000' ? '#ffffff' : '#000000';
                ctx.font = 'bold 16px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(item.number.toString(), 0, 0);
                ctx.restore();
            });
    
            // Cercle central
            ctx.beginPath();
            ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
            ctx.fillStyle = '#ffeb3b';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
        } else {
            // Effet de rotation
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius - 20, 0, Math.PI * 2);
            ctx.fill();
        }
    
        // Marqueur de gain (déplacé à gauche)
        if (winningNumber !== null) {
            const winningItem = wheelOrder.find(item => item.number === winningNumber);
            
            // Position FIXE à gauche de la roue
            const triangleBaseX = centerX - radius - 50; // 50px à gauche du bord
            const triangleCenterY = centerY;
            
            // Dimensions du triangle
            const triangleWidth = 30; // Largeur base->pointe
            const triangleHeight = 25; // Hauteur totale
            
            // Dessin du triangle pointant vers la droite
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.moveTo(triangleBaseX + triangleWidth, triangleCenterY); // Pointe à droite
            ctx.lineTo(triangleBaseX, triangleCenterY - triangleHeight/2); // Coin sup gauche
            ctx.lineTo(triangleBaseX, triangleCenterY + triangleHeight/2); // Coin inf gauche
            ctx.closePath();
            ctx.fill();
            
            // Contour noir
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Afficher le numéro gagnant dans le triangle
            ctx.fillStyle = winningItem.color;
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(winningNumber.toString(), 
                        (triangleBaseX + triangleWidth/2) - 40, 
                        triangleCenterY + 7);
        }
    };

    // ... (le reste du code reste inchangé)
    const drawBettingTable = async () => {
        // Fonction de formatage des types de paris
        const formatBetType = (type) => {
            const typeMap = {
                'red': 'Rouge',
                'black': 'Noir',
                'even': 'Pair',
                'odd': 'Impair',
                '1to18': '1-18',
                '19to36': '19-36',
                '1to12': '1-12',
                '13to24': '13-24',
                '25to36': '25-36'
            };
            
            // Retourne le nom formaté ou le type original si non trouvé
            return typeMap[type] || type;
        };
    
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.beginPath();
        ctx.roundRect(20, 20, 150, 200, 10);
        ctx.fill();
        
        // Titre du tableau
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('MISES', 95, 45);
        
        // Affichage des mises
        if (bets.length > 0) {
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'left';
            
            // Ajustement de l'espacement
            const startY = 70;
            const lineHeight = 25;
            const maxVisibleBets = 7;
            
            bets.slice(0, maxVisibleBets).forEach((bet, i) => {
                const formattedType = formatBetType(bet.type);
                ctx.fillText(
                    `${formattedType}: ${Utils.formatMoney(bet.amount)} €`,
                    30,
                    startY + i * lineHeight
                );
            });
            
            // Indicateur s'il y a plus de mises que d'espace
            if (bets.length > maxVisibleBets) {
                ctx.fillText('...', 30, startY + maxVisibleBets * lineHeight);
            }
        } else {
            // Message si aucune mise
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = 'italic 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Aucune mise', 95, 80);
        }
    };

    const drawInfo = () => {
        ctx.fillStyle = '#ffd700';
        ctx.font = "bold 28px 'Arial', sans-serif";
        ctx.textAlign = 'center';
        ctx.fillText('ROULETTE', CANVAS_WIDTH/2, 40);
        
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
            CANVAS_HEIGHT - 60,
            100,
            40,
            20
        );
        ctx.fill();
        ctx.shadowColor = 'transparent';
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SPIN', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 33);
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
        drawWheel();
        drawBettingTable();
        drawInfo();
        drawButton();
        drawWinEffect();

        return canvas;
    } catch (error) {
        console.error('Erreur dans le renderer roulette:', error);
        throw new Error('Échec du rendu de la roulette');
    }
};

module.exports = RouletteRenderer;