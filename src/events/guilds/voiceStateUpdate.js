const VoiceStats = require("../../../handlers/functions/Statistics/VoiceStats")

module.exports = {
    name: 'voiceStateUpdate',
    once: false,
    execute: async (oldState, newState, client) => {
        await VoiceStats.TimeUpdate(oldState, newState)
    }
}