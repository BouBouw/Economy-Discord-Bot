const { connection } = require("../../..");

const voiceTimeTrackers = {};

const TimeUpdate = async (oldState, newState) => {
    const userId = newState.member.id;
    const guildId = newState.guild.id;
    const channelId = newState.channelId || oldState.channelId;

    if(!oldState.channelId && newState.channelId) {
        voiceTimeTrackers[userId] = Date.now();
        console.log(`${newState.member.user.tag} a rejoint le salon vocal ${newState.channel.name}`);
    }

    if (oldState.channelId && !newState.channelId) {
        if (voiceTimeTrackers[userId]) {
            const joinTime = voiceTimeTrackers[userId];
            const leaveTime = Date.now();
            const timeSpent = Math.floor((leaveTime - joinTime) / 1000);

            saveVoiceTime(userId, guildId, channelId, timeSpent);

            delete voiceTimeTrackers[userId];
            console.log(`${oldState.member.user.tag} a quitter le salon vocal : ${oldState.channel.name}`);
        }
    }

    if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
        if (voiceTimeTrackers[userId]) {
            const joinTime = voiceTimeTrackers[userId];
            const leaveTime = Date.now();
            const timeSpent = Math.floor((leaveTime - joinTime) / 1000);

            saveVoiceTime(userId, guildId, channelId, timeSpent);

            voiceTimeTrackers[userId] = Date.now();
            console.log(`${newState.member.user.tag} a changé de salon vocal : ${oldState.channel.name} -> ${newState.channel.name}`);
        }
    }
}

function getTime(user_id, guild_id) {
    return new Promise((resolve, reject) => {
        try {
            connection.query(`
                SELECT SUM(time_spent) AS total_time_spent
                FROM voice_time
                WHERE user_id = ? AND guild_id = ?`,
                [user_id, guild_id],
            (err, result) => {
                if(err) console.error(`[Erreur SQL] ${err.message}`);
        
                return resolve(result[0].total_time_spent || 0)
            })
        } catch(err) {
            reject(0)
        }
    })
}

function saveVoiceTime(userId, guildId, channelId, timeSpent) {
    connection.query(
        `INSERT INTO voice_time (user_id, guild_id, channel_id, time_spent) VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE time_spent = time_spent + VALUES(time_spent)`,
        [userId, guildId, channelId, timeSpent],
        (err) => {
            if (err) console.error(`[Erreur SQL] ${err.message}`);
        }
    );
}

function formatTime(timeSpent) {
    const jours = Math.floor(timeSpent / (24 * 3600));
    timeSpent %= 24 * 3600;
    const heures = Math.floor(timeSpent / 3600);
    timeSpent %= 3600;
    const minutes = Math.floor(timeSpent / 60);
    timeSpent %= 60;

    return {
        day: jours,
        hours: heures,
        minutes: minutes,
        seconds: timeSpent
    }
}

const VoiceStats = {
    TimeUpdate,
    getTime,
    formatTime
}

module.exports = VoiceStats;