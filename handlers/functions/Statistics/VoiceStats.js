const prisma = require('../../database');

const voiceTimeTrackers = {};

const TimeUpdate = async (oldState, newState) => {
    const userId = newState.member.id;
    const guildId = newState.guild.id;
    const channelId = newState.channelId || oldState.channelId;

    if (!oldState.channelId && newState.channelId) {
        voiceTimeTrackers[userId] = Date.now();
        console.log(`${newState.member.user.tag} a rejoint le salon vocal ${newState.channel.name}`);
    }

    if (oldState.channelId && !newState.channelId) {
        if (voiceTimeTrackers[userId]) {
            const timeSpent = Math.floor((Date.now() - voiceTimeTrackers[userId]) / 1000);
            await saveVoiceTime(userId, guildId, channelId, timeSpent);
            delete voiceTimeTrackers[userId];
            console.log(`${oldState.member.user.tag} a quitter le salon vocal : ${oldState.channel.name}`);
        }
    }

    if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
        if (voiceTimeTrackers[userId]) {
            const timeSpent = Math.floor((Date.now() - voiceTimeTrackers[userId]) / 1000);
            await saveVoiceTime(userId, guildId, channelId, timeSpent);
            voiceTimeTrackers[userId] = Date.now();
            console.log(`${newState.member.user.tag} a changé de salon vocal : ${oldState.channel.name} -> ${newState.channel.name}`);
        }
    }
};

async function getTime(userId, guildId) {
    const result = await prisma.voiceTime.aggregate({
        where: { userId, guildId },
        _sum: { timeSpent: true }
    });
    return result._sum.timeSpent || 0;
}

async function saveVoiceTime(userId, guildId, channelId, timeSpent) {
    await prisma.voiceTime.create({
        data: { userId, guildId, channelId, timeSpent }
    });
}

function formatTime(timeSpent) {
    const jours = Math.floor(timeSpent / (24 * 3600));
    timeSpent %= 24 * 3600;
    const heures = Math.floor(timeSpent / 3600);
    timeSpent %= 3600;
    const minutes = Math.floor(timeSpent / 60);
    timeSpent %= 60;
    return { day: jours, hours: heures, minutes, seconds: timeSpent };
}

const VoiceStats = { TimeUpdate, getTime, formatTime };
module.exports = VoiceStats;
