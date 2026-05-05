const { Colors } = require('discord.js');
const prisma = require('../../database');
const Profiles = require('../Profiles');

const MessageUpdate = async (message) => {
    const profile = await Profiles.getProfile(message.author);
    if (!profile) return;

    const expGain = Math.floor(Math.random() * 11) + 5;
    let newExp = await Profiles.doubleExperience(message.author, expGain);
    let newLevel = parseInt(profile.level);

    while (newExp >= calculateRequiredExperience(newLevel)) {
        newExp -= calculateRequiredExperience(newLevel);
        newLevel++;
    }

    await updateProfileUser(message.author.id, newExp, newLevel);
    await saveMessageSent(message.author.id, message.guild.id, message.channel.id);

    if (newLevel > profile.level) {
        message.channel.send({
            embeds: [{
                color: Colors.Blue,
                description: `:tada: ${message.author} vient d'atteindre le niveau \`#${newLevel}\`.`
            }]
        });
    }
};

function calculateRequiredExperience(level) {
    const baseExp = 500;
    return Math.round(baseExp * Math.pow(2.5, level - 1));
}

async function saveMessageSent(userId, guildId, channelId) {
    await prisma.messageSent.upsert({
        where: { unique_user_guild_channel: { userId, guildId, channelId } },
        update: { messageCount: { increment: 1 } },
        create: { userId, guildId, channelId, messageCount: 1 }
    });
}

async function updateProfileUser(userId, experience, level) {
    await prisma.profile.updateMany({
        where: { userId },
        data: { experiences: experience, level }
    });
}

const MessageStats = { MessageUpdate, saveMessageSent };
module.exports = MessageStats;
