const { loadImage } = require("canvas");
const Profiles = require("../../Profiles");
const Components = require("../Components");
const { getImageBrightness, FrameGenerator } = require("../FrameGenerator");

function formatMoney(amount) {
    return new Intl.NumberFormat('fr-FR', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
    }).format(amount);
}

const Transfert = async (interaction, target, amount) => {
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
        
            const text = `Vous avez transférer \n${formatMoney(Number(amount))}€ à ${target.username}`;
            const fontSize = 20;
        
            const centerX = rectX + (rectWidth / 2);
            const centerY = rectY + (rectHeight / 2);
            
            ctx.font = `bold 14px 'SF Pro Text', sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#000000';
            ctx.fillText("TRANSFERT", centerX, 165);
        
            ctx.font = `bold ${fontSize}px 'SF Pro Text', sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#000000';
            ctx.fillText(text, centerX, (centerY - 20));

            async function drawImageOrder(user) {
                const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 128 }));
                const avatarX = centerX - 80;
                const avatarY = centerY + 50;
                const avatarSize = 40;
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
            }

            async function drawImageReceiver(target) {
                const avatar = await loadImage(target.displayAvatarURL({ extension: 'png', size: 128 }));
                const avatarX = centerX + 40;
                const avatarY = centerY + 50;
                const avatarSize = 40;
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
            }

            await drawImageOrder(interaction.user);
            await drawImageReceiver(target);
        
            ctx.font = `500 16px 'SF Pro Text', sans-serif`;
            ctx.fillStyle = textColor;
            ctx.fillText("Soldes & Comptes", 100, 360);

            const rectXStart = 25; // Position X des rectangles
            const rectYStart = 380; // Position Y de départ des rectangles
            const rectH = 80;
            const rectGap = 15; // Espace entre les rectangles

            function roundRect(x, y, width, height, radius) {
                ctx.fillStyle = '#F0F0F0';
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

            const balanceIcon = await loadImage('https://imgur.com/CDCEbvh.png');
            roundRect(rectXStart, rectYStart, rectWidth, rectH, borderRadius);
            ctx.drawImage(balanceIcon, (rectXStart + 13), rectYStart + 17, 40, 40);

            ctx.fillStyle = '#000000';
            ctx.font = `bold 20px 'SF Pro Text', sans-serif`;
            ctx.fillText("Portefeuille", rectXStart + 125, rectYStart + 25);

            ctx.fillStyle = '#393939';
            ctx.font = `600 16px 'SF Pro Text', sans-serif`;
            ctx.fillText(`${formatMoney(Number(profile.balance))} €`, rectXStart + 97, rectYStart + 50);

            const bankIcon = await loadImage('https://imgur.com/SKiFdnO.png');
            roundRect(rectXStart, rectYStart + rectH + rectGap, rectWidth, rectH, borderRadius);
            ctx.drawImage(bankIcon, (rectXStart + 10), rectYStart + (rectH + rectGap) + 17, 45, 45);

            ctx.fillStyle = '#000000';
            ctx.font = `bold 20px 'SF Pro Text', sans-serif`;
            ctx.fillText("En banque", rectXStart + 120, rectYStart + (rectH + rectGap) + 25);

            ctx.fillStyle = '#393939';
            ctx.font = `600 16px 'SF Pro Text', sans-serif`;
            ctx.fillText(`${formatMoney(Number(profile.in_bank))} €`, rectXStart + 98, rectYStart + (rectH + rectGap) + 50);

            const cryptoIcon = await loadImage('https://imgur.com/oLE0QL6.png');
            roundRect(rectXStart, rectYStart + 2 * (rectH + rectGap), rectWidth, rectH, borderRadius);
            ctx.drawImage(cryptoIcon, (rectXStart + 10), rectYStart + 2 * (rectH + rectGap) + 15, 45, 45);

            ctx.fillStyle = '#000000';
            ctx.font = `bold 20px 'SF Pro Text', sans-serif`;
            ctx.fillText("Crypto-monnaie", rectXStart + 145, rectYStart + 2 * (rectH + rectGap) + 25);

            ctx.fillStyle = '#393939';
            ctx.font = `600 16px 'SF Pro Text', sans-serif`;
            ctx.fillText(`${(Number(profile.cryptocurrencies) || 0).toFixed(3)}`, rectXStart + 97, rectYStart + 2 * (rectH + rectGap) + 50);

            return {
                ctx,
                canvas
            };
}

module.exports = Transfert;