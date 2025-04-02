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
}

async function BankBalance(interaction, profile) {
}

async function BankCard(interaction, profile) {
}

async function BankWallet(interaction, profile) {
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