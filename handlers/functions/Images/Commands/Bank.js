const { loadImage } = require("canvas");
const Profiles = require("../../Profiles");
const Components = require("../Components");
const { FrameGenerator, getImageBrightness } = require("../FrameGenerator");
const Bank = require("../../Economy/Bank");
const Cryptocurrencies = require("../../Economy/Cryptocurrencies");

function CardNumber(identifiant) {
    const idString = identifiant.toString();
    const sequences = [];

    for (let i = 0; i < idString.length; i += 4) {
        const sequence = idString.slice(i, i + 4);
        sequences.push(sequence);
    }

    return sequences.join(' ');
}

function formatMoney(amount) {
    return new Intl.NumberFormat('fr-FR', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
    }).format(amount);
}

const Banks = async (interaction, type) => {
    const profile = await Profiles.getProfile(interaction.user);
    const { ctx, canvas } = await FrameGenerator(profile);

    await Components.Headers(ctx, interaction.user, interaction.guild);

    const brightness = await getImageBrightness(profile.background_url);
    const textColor = brightness > 0.5 ? '#FFFFFF' : '#000000';

    switch(type) {
        case 'bank_account': {
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
        
            const text = `${formatMoney(Number(profile.in_bank))} €`;
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
                    const amountText = `${formatMoney(Number(transaction.amount))}€`;
                    const amountTextWidth = ctx.measureText(amountText).width;
                    ctx.fillText(amountText, x + width - amountTextWidth - rightMargin, textY - 2);
            
                    ctx.font = "500 8px 'SF Pro Text', sans-serif";
                    const dateText = `${formatDate(transaction.created_at)}`;
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
            const balanceText = `${formatMoney(Number(profile.balance || 0.00))}€`;
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

            break;
        }

        case 'e_wallet': {
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

            const getTokenPrice = await Cryptocurrencies.calculateTokenPrice(interaction.user);
            const getTokenEffect = await Cryptocurrencies.calculateTokenEffect(interaction.user);
        
            const text = `${(Number(profile.cryptocurrencies) || 0).toFixed(3)}`;
            const fontSize = 28;
        
            const centerX = rectX + (rectWidth / 2);
            const centerY = rectY + (rectHeight / 2);
            
            ctx.font = `bold 14px 'SF Pro Text', sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#000000';
            ctx.fillText("E-WALLET", centerX, 165);
        
            ctx.font = `bold ${fontSize}px 'SF Pro Text', sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#000000';
            ctx.fillText(text, centerX, centerY);

            ctx.font = `bold 12px 'SF Pro Text', sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#000000';
            ctx.fillText(`${formatMoney(Number(getTokenPrice))}€`, 148, 265);

            ctx.font = `bold 12px 'SF Pro Text', sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = getTokenEffect.isProfit ? '#00FF00' : '#FF0000';
            ctx.fillText(`${(getTokenEffect.percentageChange).toFixed(2)}%`, 215, 265);
        
            ctx.font = `500 16px 'SF Pro Text', sans-serif`;
            ctx.fillStyle = textColor;
            ctx.fillText("Dernières transactions :", 120, 360);
        
            const result = await Bank.getAccountTransactions(interaction.user);
        const transactions = result
        .filter(row => row.transaction_type === 2)
        .map(row => ({
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
            
                    ctx.font = "bold 16px 'SF Pro Text', sans-serif";
                    ctx.fillText(`${transaction.cryptocurrencie}`, x + 25, textY);
            
                    ctx.font = "bold 18px 'SF Pro Text', sans-serif";
                    const amountText = `${formatMoney(Number(transaction.amount))}€`;
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

            break;
        }

        case 'credit_card': {
            const member = await interaction.guild.members.fetch(interaction.user.id);
            const username = member.displayName;

            const card = await Components.CardsImage(interaction.user);
            const card_image = await loadImage(card);
            
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 15;
            ctx.shadowOffsetY = 10;
            
            const rectX = 20;
            const rectY = 120;
            const rectWidth = 315;
            const rectHeight = 195;
            const borderRadius = 10;
            
            ctx.fillStyle = '#F0F0F0';
            ctx.beginPath();
            ctx.roundRect(rectX, rectY, rectWidth, rectHeight, borderRadius);
            ctx.fill();
            
            ctx.restore();

            const centerX = rectX + (rectWidth / 2);
            
            ctx.font = `bold 14px 'SF Pro Text', sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#000000';
            ctx.fillText("CARTE DE CREDIT", centerX, 132);

            ctx.drawImage(card_image, 13, 145, 328, 195);
            ctx.save();

            ctx.font = `500 18px 'SF Pro Text', sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#F0F0F0';
            ctx.fillText(`${CardNumber(interaction.user.id)}`, 149, 250);

            ctx.font = `bold 22px 'SF Pro Text', sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#F0F0F0';
            ctx.fillText(`${username}`, 90, 280);

            ctx.font = `500 16px 'SF Pro Text', sans-serif`;
            ctx.fillStyle = textColor;
            ctx.fillText("Plafonds :", 65, 350);

            const cards = await Bank.bankCreditCard(interaction.user);
            const bank_amount = await Bank.bankMonthAmount(interaction.user);

            function drawProgressBar(total_amount, current_sold) {
                const x = 25;
                const y = 370;
                const progressBarHeight = 20;
                const radius = progressBarHeight / 2;
            
                const bgColor = '#e0e0e0';
            
                const maxWidth = 307;
                const progressRatio = Math.min(current_sold / total_amount, 1);
                const progressWidth = progressRatio * maxWidth;
            
                ctx.fillStyle = bgColor;
                ctx.beginPath();
                ctx.roundRect(x, y, maxWidth, progressBarHeight, radius);
                ctx.fill();
            
                const gradient = ctx.createLinearGradient(0, 0, maxWidth, 0);
                gradient.addColorStop(0, '#4caf50');
                gradient.addColorStop(1, '#2e7d32');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.roundRect(x, y, progressWidth, progressBarHeight, radius);
                ctx.fill();
            
                ctx.fillStyle = textColor;
                ctx.font = "bold 18px 'SF Pro Text', sans-serif";
                ctx.textAlign = 'left';
                ctx.fillText(`${formatMoney(current_sold)}€`, 25, y + 35);
                
                ctx.textAlign = 'right';
                ctx.fillText(`${formatMoney(total_amount)}€`, (x + maxWidth), y + 35);
            
                ctx.fillStyle = '#000000';
                ctx.font = "bold 14px 'SF Pro Text', sans-serif";
                ctx.textAlign = 'center';
                ctx.fillText(`${Math.round(progressRatio * 100)}%`, x + maxWidth / 2, y + progressBarHeight / 2);
            }
            drawProgressBar(cards.current_card.sold, Number(bank_amount.total_amount) || 0.00);

            // prochaine carte (si disponible)
            if(profile.credit_card !== 5) {
                ctx.font = `500 16px 'SF Pro Text', sans-serif`;
                ctx.fillStyle = textColor;
                ctx.fillText("Prochaine carte :", 95, 450);

                const card = await Components.NextCardsImage(interaction.user);
                const card_image = await loadImage(card);

                ctx.drawImage(card_image, 13, 470, 328, 195);
                ctx.save();

                const costMapping = {
                    0: 0,
                    1: 2500,
                    2: 4500,
                    3: 9500,
                    4: 25000,
                    5: 95000
                }

                ctx.font = `bold 16px 'SF Pro Text', sans-serif`;
                ctx.fillStyle = textColor;
                ctx.fillText(`Coût : ${formatMoney(Number(costMapping[profile.credit_card + 1]))} €`, 103, 665);

                ctx.font = `bold 16px 'SF Pro Text', sans-serif`;
                ctx.fillStyle = textColor;
                ctx.fillText(`Plafonds : ${formatMoney(Number(costMapping[profile.credit_card + 1]))} €`, 120, 685);
            }

            break;
        }
    }

    return {
        ctx,
        canvas
    };
};

module.exports = Banks;