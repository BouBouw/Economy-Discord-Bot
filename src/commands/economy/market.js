const { ApplicationCommandType } = require("discord.js");

const Cryptocurrencies = require("../../../handlers/functions/Economy/Cryptocurrencies")

module.exports = {
    name: 'market',
    description: '(🪙) Economy',
    type: ApplicationCommandType.ChatInput,
    execute: async (client, interaction, args, con) => {
        const marketData = await Cryptocurrencies.getMarketData();
        console.log(marketData)
    }
}