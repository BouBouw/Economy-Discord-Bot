const { ApplicationCommandOptionType, ApplicationCommandType } = require("discord.js");
const Cryptocurrencies = require("../../../handlers/functions/Economy/Cryptocurrencies");
const Profiles = require("../../../handlers/functions/Profiles");
const ImageGenerator = require("../../../handlers/functions/Images/ImageGenerator");

module.exports = {
    name: 'buy',
    description: '(🪙) Economy',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "montant",
            description: "Montant a investir",
            type: ApplicationCommandOptionType.Number,
            required: true,
            min_value: 0.01,
        }
    ],
    execute: async (client, interaction, args, con) => {
        const current_profile = await Profiles.getProfile(interaction.user);
        const coins = parseFloat(interaction.options.getNumber('montant')).toFixed(2);

        Cryptocurrencies.buyToken(interaction.user, coins).then(async (res) => {
            const crypto_card = await ImageGenerator.CryptoBuy(interaction, current_profile, coins, res);

            await interaction.reply({
                files: [crypto_card],
            })
        })
    }
}