const { ApplicationCommandType } = require("discord.js");

// const Cryptocurrencies = require("../../../handlers/functions/Economy/Cryptocurrencies");

const { CryptoMarket } = require("../../../handlers/functions/Cryptocurrency/CryptoMarket");
const { CryptoChain } = require("../../../handlers/functions/Cryptocurrency/Blockchain");

module.exports = {
    name: 'chart',
    description: '(🪙) Economy',
    type: ApplicationCommandType.ChatInput,
    execute: async (client, interaction, args, con) => {
        const market = new CryptoMarket();
        const blockchain = new CryptoChain();
        await blockchain.initialize();

        const currentPrice = await market.updatePrice();
        const chartImage = await market.generatePriceChart();
        
        interaction.reply({
            content: `💰 Prix actuel: ${currentPrice.toFixed(4)}€/X`,
            files: [{
                attachment: chartImage,
                name: 'price_chart.png'
            }]
        });
    }
}