const { loadImage } = require("canvas");
const Profiles = require("../../Profiles");
const Components = require("../Components");
const { FrameGenerator, getImageBrightness } = require("../FrameGenerator");
const Bank = require("../../Economy/Bank");

const Developer = async (interaction) => {
    const profile = await Profiles.getProfile(interaction.user);
    const { ctx, canvas } = await FrameGenerator(profile);

    await Components.Headers(ctx, interaction.user, interaction.guild);

    const brightness = await getImageBrightness(profile.background_url);
    const textColor = brightness > 0.5 ? '#FFFFFF' : '#000000';

    const card = await Components.CardsImage(interaction.user);
    const card_image = await loadImage(card);

    ctx.drawImage(card_image, 20, 120, 315, 195);
    ctx.save();
    
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetY = 10;
    
    const rectX = 25;
    const rectY = 145;
    const rectWidth = 305;
    const rectHeight = 195;
    const borderRadius = 10;
    
    ctx.fillStyle = '#F0F0F0';
    ctx.beginPath();
    ctx.roundRect(rectX, rectY, rectWidth, rectHeight, borderRadius);
    ctx.fill();
    
    ctx.restore();

    const text = `${profile.in_bank} €`;
    const fontSize = 28;

    const centerX = rectX + (rectWidth / 2);
    const centerY = rectY + (rectHeight / 2);
    
    ctx.font = `bold 14px 'SF Pro Text', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000000';
    ctx.fillText("MON COMPTE", centerX, 165);

    ctx.font = `bold ${fontSize}px 'SF Pro Text', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000000';
    ctx.fillText(text, centerX, centerY);

    ctx.font = `500 16px 'SF Pro Text', sans-serif`;
    ctx.fillStyle = textColor;
    ctx.fillText("Dernières transactions :", 120, 360);

    const result = await Bank.getAccountTransactions(interaction.user);
    const transactions = result.map(row => ({
        type: row.transaction_type,
        amount: row.amount,
        cryptocurrencie: row.cryptocurrencie,
        reason: row.reason || "Non spécifié",
        created_at: row.created_at,
    }));

    function drawTransactions(transactions) {
        const x = 25; // Position X de départ
        const startY = 380; // Position Y de départ
        const width = 305; // Largeur des rectangles
        const height = 50; // Hauteur de chaque rectangle
        const borderRadius = 5; // Rayon des coins arrondis
        const spaceBetween = 5; // Espace entre les rectangles (en pixels)
    
        ctx.font = '10px Sans-Serif';
        ctx.textBaseline = 'middle';
    
        const rightMargin = -25;
    
        transactions.forEach((transaction, index) => {
            const rectY = startY + index * (height + spaceBetween);
    
            ctx.beginPath();
            ctx.roundRect(x, rectY, width, height, borderRadius);
            ctx.fillStyle = '#F0F0F0';
            ctx.fill();
    
            ctx.fillStyle = '#000000';
    
            const textY = rectY + height / 2;
    
            ctx.font = "bold 14px 'SF Pro Text', sans-serif";
            ctx.fillText(`${transaction.reason}`, x + 70, textY);
    
            ctx.font = "bold 18px 'SF Pro Text', sans-serif";
            const amountText = `${transaction.amount}€`;
            const amountTextWidth = ctx.measureText(amountText).width;
            ctx.fillText(amountText, x + width - amountTextWidth - rightMargin, textY - 2);
    
            ctx.font = "500 8px 'SF Pro Text', sans-serif";
            const dateText = `${formatDate(transaction.created_at)}`;
            const dateTextWidth = ctx.measureText(dateText).width;
            ctx.fillText(dateText, 298, textY + 15);
        });
    }
    drawTransactions(transactions);
    function formatDate(dateString) {
        const date = new Date(dateString);
        return `${date.getDate() < 10 ? '0' : '' }${date.getDate()}/${date.getMonth() + 1 < 10 ? '0' : ''}${date.getMonth() + 1}/${date.getFullYear()}`;
    }

    ctx.font = `500 16px 'SF Pro Text', sans-serif`;
    ctx.fillStyle = textColor;
    ctx.fillText("Monnaies & Epargnes :", 115, 560);

    ctx.fillStyle = '#F0F0F0';
    const x = 25;
    const y = 580;
    const width = 305;
    const height = 50;
    const borderRadiusRec = 5;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, borderRadiusRec);
    ctx.roundRect(x, (y + (height + 5)), width, height, borderRadiusRec);
    ctx.fill();

    const rightMargin = -20;

    const balanceIcon = await loadImage('https://imgur.com/CDCEbvh.png');
    ctx.drawImage(balanceIcon, (x + 10), 593, 24, 24);

    ctx.fillStyle = '#000000';
    ctx.font = "500 16px 'SF Pro Text', sans-serif";
    ctx.fillText("En poche", (x + 80), 605);

    ctx.font = "bold 18px 'SF Pro Text', sans-serif";
    const balanceText = `${profile.balance || 0.00}€`;
    const balanceTextWidth = ctx.measureText(balanceText).width;
    ctx.fillText(balanceText, x + width - balanceTextWidth - rightMargin, 605);

    const cryptoIcon = await loadImage('https://imgur.com/oLE0QL6.png');
    ctx.drawImage(cryptoIcon, (x + 10), 645, 28, 28);

    ctx.fillStyle = '#000000';
    ctx.font = "500 16px 'SF Pro Text', sans-serif";
    ctx.fillText("Crypto-monnaie", (x + 109), 658);

    ctx.font = "bold 18px 'SF Pro Text', sans-serif";
    const cryptoText = `${(Number(profile.cryptocurrencies) || 0).toFixed(3)}`;
    const cryptoTextWidth = ctx.measureText(cryptoText).width;
    ctx.fillText(cryptoText, x + width - cryptoTextWidth - rightMargin, 658);

    return {
        ctx,
        canvas
    };
};

module.exports = Developer;