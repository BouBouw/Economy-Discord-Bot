const { createCanvas, loadImage } = require('canvas');
const Bank = require('../Economy/Bank');
const { AttachmentBuilder } = require('discord.js');
const Cryptocurrencies = require('../Economy/Cryptocurrencies');

async function CryptoBuy(interaction, profile, amount, sold) {
    const canvas = createCanvas(450, 611);
    const ctx = canvas.getContext('2d');

    // https://imgur.com/e2yX7ww
    const background = await loadImage('https://imgur.com/e2yX7ww.png');
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    const rectX = 125; // Position X des rectangles

    const avatar = await loadImage(interaction.user.displayAvatarURL({ extension: 'png', size: 128 }));
    const avatarX = 125;
    const avatarY = 110;
    const avatarSize = 30;
    ctx.save();
    ctx.beginPath();
    ctx.arc(
        avatarX + avatarSize / 2,
        avatarY + avatarSize / 2,
        avatarSize / 2,
        0,
        Math.PI * 2
    );
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();

    // HEADERS
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const username = member.displayName;
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 11px Sans-Serif';
    ctx.fillText(username, 161, 123);
    ctx.fillStyle = '#969696';
    ctx.font = '9px Sans-Serif';
    ctx.fillText(`@${interaction.user.username}`, 161, 133);
    const verified = await loadImage('https://imgur.com/uPt0mcg.png');
    profile.premium_type !== 0 ? ctx.drawImage(verified, 300, avatarY, 24, 24) : null;

    // MAIN CONTENT
    const marketData = await Cryptocurrencies.getMarketData();
    const crypto_amount = marketData.current_price * amount;

    ctx.fillStyle = '#000000';
    ctx.font = '16px Sans-Serif';
    ctx.textAlign = 'center'; // Centrer le texte horizontalement
    const transactionText = `Vous avez acheté ${amount}€ (${crypto_amount}) de crypto-monnaies`;
    const maxWidth = 160; // Largeur maximale du texte
    const textX = rectX + maxWidth / 2; // Position X centrée

    // Ajuster la taille de la police si le texte est trop long
    let fontSize = 18;
    while (ctx.measureText(transactionText).width > maxWidth && fontSize > 10) {
        fontSize -= 1;
        ctx.font = `${fontSize}px Sans-Serif`;
    }

    ctx.fillText(transactionText, textX, 230);

    const buffer = canvas.toBuffer('image/png');
    const attachment = new AttachmentBuilder(buffer, { name: 'crypto.png' });
    return attachment;
}

async function CryptoSell(interaction, profile, amount, sold) {
    const canvas = createCanvas(450, 611);
    const ctx = canvas.getContext('2d');

    // https://imgur.com/e2yX7ww
    const background = await loadImage('https://imgur.com/e2yX7ww.png');
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    const rectX = 125; // Position X des rectangles

    const avatar = await loadImage(interaction.user.displayAvatarURL({ extension: 'png', size: 128 }));
    const avatarX = 125;
    const avatarY = 110;
    const avatarSize = 30;
    ctx.save();
    ctx.beginPath();
    ctx.arc(
        avatarX + avatarSize / 2,
        avatarY + avatarSize / 2,
        avatarSize / 2,
        0,
        Math.PI * 2
    );
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();

    // HEADERS
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const username = member.displayName;
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 11px Sans-Serif';
    ctx.fillText(username, 161, 123);
    ctx.fillStyle = '#969696';
    ctx.font = '9px Sans-Serif';
    ctx.fillText(`@${interaction.user.username}`, 161, 133);
    const verified = await loadImage('https://imgur.com/uPt0mcg.png');
    profile.premium_type !== 0 ? ctx.drawImage(verified, 300, avatarY, 24, 24) : null;

    // MAIN CONTENT
    const marketData = await Cryptocurrencies.getMarketData();
    const crypto_amount = marketData.current_price * amount;

    ctx.fillStyle = '#000000';
    ctx.font = '10px Sans-Serif';
    ctx.textAlign = 'center'; // Centrer le texte horizontalement
    const transactionText = `Vous avez vendu ${crypto_amount} (${amount}€) de crypto-monnaies`;
    const maxWidth = 160; // Largeur maximale du texte
    const textX = rectX + maxWidth / 2; // Position X centrée

    // Ajuster la taille de la police si le texte est trop long
    let fontSize = 18;
    while (ctx.measureText(transactionText).width > maxWidth && fontSize > 10) {
        fontSize -= 1;
        ctx.font = `${fontSize}px Sans-Serif`;
    }

    ctx.fillText(transactionText, textX, 230);

    const buffer = canvas.toBuffer('image/png');
    const attachment = new AttachmentBuilder(buffer, { name: 'crypto.png' });
    return attachment;
}

async function BankTransfert(interaction, target, profile, amount) {
    const canvas = createCanvas(450, 611);
    const ctx = canvas.getContext('2d');

    const background = await loadImage('https://imgur.com/23EIzVm.png');
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    const rectWidth = 199; // Largeur des rectangles
    const rectHeight = 50; // Hauteur des rectangles
    const rectX = 125; // Position X des rectangles
    const rectYStart = 330; // Position Y de départ des rectangles
    const rectGap = 10; // Espace entre les rectangles
    const rectRadius = 10; // Rayon des coins arrondis


    // HEADERS
    const avatar = await loadImage(interaction.user.displayAvatarURL({ extension: 'png', size: 128 }));
    const avatarX = 125;
    const avatarY = 110;
    const avatarSize = 30;
    ctx.save();
    ctx.beginPath();
    ctx.arc(
        avatarX + avatarSize / 2,
        avatarY + avatarSize / 2,
        avatarSize / 2,
        0,
        Math.PI * 2
    );
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();

    // HEADERS
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const username = member.displayName;
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 11px Sans-Serif';
    ctx.fillText(username, 161, 123);
    ctx.fillStyle = '#969696';
    ctx.font = '9px Sans-Serif';
    ctx.fillText(`@${interaction.user.username}`, 161, 133);
    const verified = await loadImage('https://imgur.com/uPt0mcg.png');
    profile.premium_type !== 0 ? ctx.drawImage(verified, 300, avatarY, 24, 24) : null;

    // MAIN CONTENT
    ctx.fillStyle = '#000000';
    ctx.font = '16px Sans-Serif';
    ctx.textAlign = 'center'; // Centrer le texte horizontalement
    const transactionText = `Vous avez transféré ${amount}€ à ${target.username}`;
    const maxWidth = 199; // Largeur maximale du texte
    const textX = rectX + maxWidth / 2; // Position X centrée

    // Ajuster la taille de la police si le texte est trop long
    let fontSize = 18;
    while (ctx.measureText(transactionText).width > maxWidth && fontSize > 10) {
        fontSize -= 1;
        ctx.font = `${fontSize}px Sans-Serif`;
    }

    ctx.fillText(transactionText, textX, 230);

    // SECOND CONTENT
    ctx.fillStyle = '#393939';
    ctx.font = 'bold 10px Sans-Serif';
    ctx.textAlign = 'left'; // Réinitialiser l'alignement du texte
    ctx.fillText("Solde & Comptes", 125, 320);

    // Dessiner les rectangles gris avec des coins arrondis
    // Fonction pour dessiner un rectangle avec des coins arrondis
    function roundRect(x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.arcTo(x + width, y, x + width, y + radius, radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
        ctx.lineTo(x + radius, y + height);
        ctx.arcTo(x, y + height, x, y + height - radius, radius);
        ctx.lineTo(x, y + radius);
        ctx.arcTo(x, y, x + radius, y, radius);
        ctx.closePath();
        ctx.fill();
    }

    // Couleur de fond des rectangles
    ctx.fillStyle = '#F0F0F0'; // Gris clair

    // Premier rectangle : Solde en poche
    roundRect(rectX, rectYStart, rectWidth, rectHeight, rectRadius);
    ctx.fillStyle = '#000000'; // Texte en noir
    ctx.font = 'bold 12px Sans-Serif';
    ctx.fillText("Solde en poche", rectX + 10, rectYStart + 20);
    ctx.fillStyle = '#393939'; // Texte en gris foncé
    ctx.font = '10px Sans-Serif';
    ctx.fillText(`${profile.balance} €`, rectX + 10, rectYStart + 35);

    // Deuxième rectangle : Compte en banque
    ctx.fillStyle = '#F0F0F0'; // Gris clair
    roundRect(rectX, rectYStart + rectHeight + rectGap, rectWidth, rectHeight, rectRadius);
    ctx.fillStyle = '#000000'; // Texte en noir
    ctx.font = 'bold 12px Sans-Serif';
    ctx.fillText("Compte en banque", rectX + 10, rectYStart + rectHeight + rectGap + 20);
    ctx.fillStyle = '#393939'; // Texte en gris foncé
    ctx.font = '10px Sans-Serif';
    ctx.fillText(`${profile.in_bank} €`, rectX + 10, rectYStart + rectHeight + rectGap + 35);

    // Troisième rectangle : Crypto-monnaie
    ctx.fillStyle = '#F0F0F0'; // Gris clair
    roundRect(rectX, rectYStart + 2 * (rectHeight + rectGap), rectWidth, rectHeight, rectRadius);
    ctx.fillStyle = '#000000'; // Texte en noir
    ctx.font = 'bold 12px Sans-Serif';
    ctx.fillText("Crypto-monnaie", rectX + 10, rectYStart + 2 * (rectHeight + rectGap) + 20);
    ctx.fillStyle = '#393939'; // Texte en gris foncé
    ctx.font = '10px Sans-Serif';
    ctx.fillText(`${profile.cryptocurrencies} €`, rectX + 10, rectYStart + 2 * (rectHeight + rectGap) + 35);

    const buffer = canvas.toBuffer('image/png');
    const attachment = new AttachmentBuilder(buffer, { name: 'bank.png' });
    return attachment;
}

async function BankBalance(interaction, profile) {
        const canvas = createCanvas(450, 611);
        const ctx = canvas.getContext('2d');

        const background = await loadImage('https://imgur.com/qaLnKjc.png');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // HEADERS
        const avatar = await loadImage(interaction.user.displayAvatarURL({ extension: 'png', size: 128 }));
        const avatarX = 125;
        const avatarY = 110;
        const avatarSize = 30;
        ctx.save();
        ctx.beginPath();
        ctx.arc(
            avatarX + avatarSize / 2,
            avatarY + avatarSize / 2,
            avatarSize / 2,
            0,
            Math.PI * 2
        );
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();

        // HEADERS
        const member = await interaction.guild.members.fetch(interaction.user.id);
        const username = member.displayName;
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 11px Sans-Serif';
        ctx.fillText(username, 161, 123);
        ctx.fillStyle = '#969696';
        ctx.font = '9px Sans-Serif';
        ctx.fillText(`@${interaction.user.username}`, 161, 133);
        const verified = await loadImage('https://imgur.com/uPt0mcg.png');
        profile.premium_type !== 0 ? ctx.drawImage(verified, 300, avatarY, 24, 24): null;

        // MAIN CONTENT
        ctx.fillStyle = '#000000';
        ctx.font = '8px Sans-Serif';
        ctx.fillText(`MON COMPTE`, 200, 180);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 20px Sans-Serif';
        const inBankText = `${profile.in_bank || 0.00} €`;
        const inBankSize = ctx.measureText(inBankText).width;
        const middleX = 225;
        const startX = middleX - (inBankSize / 2); 
        ctx.fillText(`${profile.in_bank || 0.00} €`, startX, 210);

        // TRANSACTIONS
        const result = await Bank.getAccountTransactions(interaction.user);
        const transactions = result.map(row => ({
            type: row.transaction_type,
            amount: row.amount,
            cryptocurrencie: row.cryptocurrencie,
            reason: row.reason || "Non spécifié",
            created_at: row.created_at,
        }));
        ctx.fillStyle = '#393939';
        ctx.font = 'bold 10px Sans-Serif';
        ctx.fillText("Dernières transactions", 125, 305);
        function drawTransactions(transactions) {
            const x = 125; // Position X de départ
            const startY = 315; // Position Y de départ
            const width = 199; // Largeur des rectangles
            const height = 35; // Hauteur de chaque rectangle
            const borderRadius = 5; // Rayon des coins arrondis
            const spaceBetween = 5; // Espace entre les rectangles (en pixels)
        
            ctx.font = '10px Sans-Serif';
            ctx.textBaseline = 'middle';
        
            const rightMargin = 10;
        
            transactions.forEach((transaction, index) => {
                const rectY = startY + index * (height + spaceBetween);
        
                ctx.beginPath();
                ctx.roundRect(x, rectY, width, height, borderRadius);
                ctx.fillStyle = '#F0F0F0';
                ctx.fill();
        
                ctx.fillStyle = '#000000';
        
                const textY = rectY + height / 2;
        
                ctx.font = '10px Sans-Serif';
                ctx.fillText(`${transaction.reason}`, x + 10, textY);
        
                ctx.font = 'bold 12px Sans-Serif';
                const amountText = `${transaction.amount}€`;
                const amountTextWidth = ctx.measureText(amountText).width;
                ctx.fillText(amountText, x + width - amountTextWidth - rightMargin, textY - 2);
        
                ctx.font = '6px Sans-Serif';
                const dateText = `${formatDate(transaction.created_at)}`;
                const dateTextWidth = ctx.measureText(dateText).width;
                ctx.fillText(dateText, x + width - dateTextWidth - rightMargin, textY + 10);
            });
        }
        drawTransactions(transactions);
        function formatDate(dateString) {
            const date = new Date(dateString);
            return `${date.getDate() < 10 ? '0' : '' }${date.getDate()}/${date.getMonth() + 1 < 10 ? '0' : ''}${date.getMonth() + 1}/${date.getFullYear()}`;
        }

        // ACCOUNTS & POCKET
        ctx.fillStyle = '#393939';
        ctx.font = 'bold 10px Sans-Serif';
        ctx.fillText("Comptes & Monnaies", 125, 445);
        ctx.fillStyle = '#F0F0F0';
        const x = 125;
        const y = 455;
        const width = 199;
        const height = 35;
        const borderRadius = 5;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, borderRadius);
        ctx.roundRect(x, (y + (height + 5)), width, height, borderRadius);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.font = '10px Sans-Serif';
        ctx.fillText("En poche", (x + 40), (y + 18));
        ctx.fillText("Crypto-monnaie", (x + 40), (y + (height + 22)));
        const bankIcon = await loadImage('https://imgur.com/CDCEbvh.png');
        ctx.drawImage(bankIcon, (x + 10), (y + 7), 20, 20);
        const cryptoIcon = await loadImage('https://imgur.com/oLE0QL6.png');
        ctx.drawImage(cryptoIcon, (x + 10), (y + (height + 10)), 24, 24);
        const rightMargin = 10;
        ctx.font = 'bold 12px Sans-Serif';
        const balanceText = `${profile.balance || 0.00}€`;
        const balanceTextWidth = ctx.measureText(balanceText).width;
        ctx.fillText(balanceText, x + width - balanceTextWidth - rightMargin, y + 18);
        const cryptoText = `${profile.cryptocurrencies || 0.00}`;
        const cryptoTextWidth = ctx.measureText(cryptoText).width;
        ctx.fillText(cryptoText, x + width - cryptoTextWidth - rightMargin, y + (height + 22));

        const buffer = canvas.toBuffer('image/png');
        const attachment = new AttachmentBuilder(buffer, { name: 'bank.png' });
        return attachment;
}

async function BankCard(interaction, profile) {
    const canvas = createCanvas(450, 611);
    const ctx = canvas.getContext('2d');

    let t;
    switch(profile.credit_card) {
        case 0: t = 'https://imgur.com/vwuBzN4'; break;
        case 1: t = 'https://imgur.com/Jksg5l8'; break;
        case 2: t = 'https://imgur.com/GY7eqP2'; break;
        case 3: t = 'https://imgur.com/gqyTdvs'; break;
        case 4: t = 'https://imgur.com/38NEKa6'; break;
        case 5: t = 'https://imgur.com/g93Nl8q'; break;
        default: t = 'https://imgur.com/vwuBzN4'; break;
    }

    const background = await loadImage(`${t}.png`);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // HEADERS
    const avatar = await loadImage(interaction.user.displayAvatarURL({ extension: 'png', size: 128 }));
    const avatarX = 125;
    const avatarY = 110;
    const avatarSize = 30;
    ctx.save();
    ctx.beginPath();
    ctx.arc(
        avatarX + avatarSize / 2,
        avatarY + avatarSize / 2,
        avatarSize / 2,
        0,
        Math.PI * 2
    );
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();

    const member = await interaction.guild.members.fetch(interaction.user.id);
    const username = member.displayName;
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 11px Sans-Serif';
    ctx.fillText(username, 161, 123);
    ctx.fillStyle = '#969696';
    ctx.font = '9px Sans-Serif';
    ctx.fillText(`@${interaction.user.username}`, 161, 133);
    const verified = await loadImage('https://imgur.com/uPt0mcg.png');
    profile.premium_type !== 0 ? ctx.drawImage(verified, 300, avatarY, 24, 24): null

    // MAIN CONTENT
    ctx.fillStyle = '#F0F0F0';
    ctx.font = '10px Sans-Serif';
    ctx.fillText(`${CardNumber(interaction.user.id)}`, 140, 250);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px Sans-Serif';
    ctx.fillText(`${username}`, 140, 270);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '6px Sans-Serif';
    ctx.fillText(`Expire at`, 245, 275);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '8px Sans-Serif';
    ctx.fillText(`05/32`, 245, 285);

    // SECOND CONTENT
    const card = await Bank.bankCreditCard(interaction.user);
    const bank_amount = await Bank.bankMonthAmount(interaction.user);

    ctx.fillStyle = '#393939';
    ctx.font = 'bold 10px Sans-Serif';
    ctx.fillText("Plafonds", 125, 320);

    function drawProgressBar(total_amount, current_sold) {
        const x = 125;
        const progressBarHeight = 30;

        const progressBarColor = '#4caf50';
        const textColor = '#000000';

        const maxWidth = 199;
        const progressWidth = (total_amount / current_sold) * maxWidth;

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 12px Sans-Serif';
        ctx.fillText(`${current_sold}€`, 125, 340);
        ctx.fillText(`${total_amount}€`, 275, 340);

        // progress bar 
    }
    drawProgressBar(card.current_card.sold, Number(bank_amount.total_amount) || 0.00);

    const buffer = canvas.toBuffer('image/png');
    const attachment = new AttachmentBuilder(buffer, { name: 'bank.png' });
    return attachment;

    function CardNumber(identifiant) {
        const idString = identifiant.toString();
        const sequences = [];

        for (let i = 0; i < idString.length; i += 4) {
            // Extraire une séquence de 4 chiffres
            const sequence = idString.slice(i, i + 4);
            sequences.push(sequence);
        }

        return sequences.join(' ');
    }
}

async function BankWallet(interaction, profile) {
    const canvas = createCanvas(450, 611);
    const ctx = canvas.getContext('2d');

    const background = await loadImage('https://imgur.com/788mJyI.png');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // HEADERS
        const avatar = await loadImage(interaction.user.displayAvatarURL({ extension: 'png', size: 128 }));
        const avatarX = 125;
        const avatarY = 110;
        const avatarSize = 30;
        ctx.save();
        ctx.beginPath();
        ctx.arc(
            avatarX + avatarSize / 2,
            avatarY + avatarSize / 2,
            avatarSize / 2,
            0,
            Math.PI * 2
        );
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();

        // HEADERS
        const member = await interaction.guild.members.fetch(interaction.user.id);
        const username = member.displayName;
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 11px Sans-Serif';
        ctx.fillText(username, 161, 123);
        ctx.fillStyle = '#969696';
        ctx.font = '9px Sans-Serif';
        ctx.fillText(`@${interaction.user.username}`, 161, 133);
        const verified = await loadImage('https://imgur.com/uPt0mcg.png');
        profile.premium_type !== 0 ? ctx.drawImage(verified, 300, avatarY, 24, 24): null;

        // MAIN CONTENT 
        const getTokenPrice = await Cryptocurrencies.calculateTokenPrice(interaction.user);
        const getTokenEffect = await Cryptocurrencies.calculateTokenEffect(interaction.user);
        console.log(getTokenEffect)

        console.log(getTokenPrice)
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 22px Sans-Serif';
        ctx.fillText(`${profile.cryptocurrencies}`, 185, 225);

        ctx.fillStyle = '#000000';
        ctx.font = '12px Sans-Serif';
        ctx.fillText(`${getTokenPrice}€`, 185, 240);

        ctx.fillStyle = getTokenEffect.isProfit ? '#00FF00' : '#FF0000';
        ctx.font = '12px Sans-Serif';
        ctx.fillText(`${getTokenEffect.percentageChange}%`, 245, 240);

        // SECOND CONTENT 
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

        ctx.fillStyle = '#393939';
        ctx.font = 'bold 10px Sans-Serif';
        ctx.fillText("Dernières transactions", 125, 320);

        function drawTransactions(transactions) {
            const x = 125; // Position X de départ
            const startY = 330; // Position Y de départ
            const width = 199; // Largeur des rectangles
            const height = 35; // Hauteur de chaque rectangle
            const borderRadius = 5; // Rayon des coins arrondis
            const spaceBetween = 5; // Espace entre les rectangles (en pixels)
        
            ctx.font = '10px Sans-Serif';
            ctx.textBaseline = 'middle';
        
            const rightMargin = 10;
        
            transactions.forEach((transaction, index) => {
                const rectY = startY + index * (height + spaceBetween);
        
                ctx.beginPath();
                ctx.roundRect(x, rectY, width, height, borderRadius);
                ctx.fillStyle = '#F0F0F0';
                ctx.fill();
        
                ctx.fillStyle = '#000000';
        
                const textY = rectY + height / 2;
        
                ctx.font = 'bold 12px Sans-Serif';
                ctx.fillText(`${transaction.cryptocurrencie}`, x + 10, textY);
        
                ctx.font = 'bold 12px Sans-Serif';
                const amountText = `${transaction.amount}€`;
                const amountTextWidth = ctx.measureText(amountText).width;
                ctx.fillText(amountText, x + width - amountTextWidth - rightMargin, textY - 2);
        
                ctx.font = '6px Sans-Serif';
                const dateText = `${formatDate(transaction.created_at)}`;
                const dateTextWidth = ctx.measureText(dateText).width;
                ctx.fillText(dateText, x + width - dateTextWidth - rightMargin, textY + 10);
            });
        }
        drawTransactions(transactions);
        function formatDate(dateString) {
            const date = new Date(dateString);
            return `${date.getDate() < 10 ? '0' : '' }${date.getDate()}/${date.getMonth() + 1 < 10 ? '0' : ''}${date.getMonth() + 1}/${date.getFullYear()}`;
        }
        console.log(transactions)

    const buffer = canvas.toBuffer('image/png');
    const attachment = new AttachmentBuilder(buffer, { name: 'bank.png' });
    return attachment;
}

const ImageGenerator = {
    CryptoBuy,
    CryptoSell,
    BankTransfert,
    BankBalance,
    BankCard,
    BankWallet
};

module.exports = ImageGenerator;