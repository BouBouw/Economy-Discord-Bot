const { loadImage, registerFont } = require("canvas");
const Profiles = require("../Profiles");
const { getImageBrightness } = require("./FrameGenerator");

registerFont('./handlers/functions/Images/Fonts/SF-Pro-Text-Regular.otf', { 
    family: 'SF Pro Text',
    weight: 'regular',
    style: "normal"
});

registerFont('./handlers/functions/Images/Fonts/SF-Pro-Text-Bold.otf', { 
    family: 'SF Pro Text',
    weight: 'bold',
    style: "normal"
});

registerFont('./handlers/functions/Images/Fonts/SF-Pro-Text-Medium.otf', { 
    family: 'SF Pro Text',
    weight: '500',
    style: "normal"
});

registerFont('./handlers/functions/Images/Fonts/SF-Pro-Text-Semibold.otf', { 
    family: 'SF Pro Text',
    weight: '600',
    style: "normal"
});

async function Headers(ctx, user, guild) {
    const profile = await Profiles.getProfile(user);

    const brightness = await getImageBrightness(profile.background_url);
    const textColor = brightness > 0.5 ? '#FFFFFF' : '#000000';

    const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 128 }));
    const avatarX = 25;
    const avatarY = 55;
    const avatarSize = 45;
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
    
    const member = await guild.members.fetch(user.id);
    const username = member.displayName;
    ctx.fillStyle = textColor;
    ctx.font = 'bold 18px "SF Pro Text"';
    ctx.fillText(username, 80, 75);
    ctx.fillStyle = '#969696';
    ctx.font = '600 14px "SF Pro Text"';
    ctx.fillText(`@${user.username}`, 80, 95);

    const verified = await loadImage('https://imgur.com/uPt0mcg.png');
    profile.premium_type !== 0 ? ctx.drawImage(verified, 290, 60, 35, 35): null;
}

async function CardsImage(user) {
    const profile = await Profiles.getProfile(user);

    const cardMapping = {
        0: "https://imgur.com/O8TEFuq.png",
        1: "https://imgur.com/A6kAOnB.png",
        2: "https://imgur.com/aUVIDwD.png",
        3: "https://imgur.com/lYQPpW1.png",
        4: "https://imgur.com/PSuXEsu.png",
        5: "https://imgur.com/kXjMGGO.png"
    }

    return cardMapping[profile.credit_card];
}

async function NextCardsImage(user) {
    const profile = await Profiles.getProfile(user);

    const cardMapping = {
        0: "https://imgur.com/O8TEFuq.png",
        1: "https://imgur.com/A6kAOnB.png",
        2: "https://imgur.com/aUVIDwD.png",
        3: "https://imgur.com/lYQPpW1.png",
        4: "https://imgur.com/PSuXEsu.png",
        5: "https://imgur.com/kXjMGGO.png"
    }

    return cardMapping[profile.credit_card + 1];
}

const Components = {
    Headers,
    CardsImage,
    NextCardsImage
}

module.exports = Components;