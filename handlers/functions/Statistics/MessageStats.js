const { Colors } = require("discord.js");
const { connection } = require("../../..");
const Profiles = require("../Profiles");

const MessageUpdate = async (message) => {
    const profile = await Profiles.getProfile(message.author);
    if(!profile) return;

    const expGain = Math.floor(Math.random() * 11) + 5;
    let newExp = await Profiles.doubleExperience(message.author, expGain);
    let newLevel = parseInt(profile.level);

    while(newExp >= calculateRequiredExperience(newLevel)) {
        newExp -= calculateRequiredExperience(newLevel);
        newLevel++;
    }

    await updateProfileUser(message.author.id, newExp, newLevel);
    await saveMessageSent(message.author.id, message.guild.id, message.channel.id);

    if(newLevel > profile.level) {
        message.channel.send({
            embeds: [{
                color: Colors.Blue,
                description: `:tada: ${message.author} vient d'atteindre le niveau \`#${newLevel}\`.`
            }]
        })
    }
}

async function calculateRequiredExperience(level) {
    const baseExp = 500;
    return Math.round(baseExp * Math.pow(2.5, level - 1));
}

function saveMessageSent(userId, guildId, channelId) {
    connection.query(
        `INSERT INTO message_sent (user_id, guild_id, channel_id, message_count)
         VALUES (?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE message_count = message_count + 1`,
        [userId, guildId, channelId]
    );
}

function updateProfileUser(userId, experience, level) {
    connection.query(
        `UPDATE profiles SET experiences = ?, level = ? WHERE user_id = ?`, 
        [experience, level, userId]
    );
}

const MessageStats = {
    MessageUpdate,
    saveMessageSent
}

module.exports = MessageStats;