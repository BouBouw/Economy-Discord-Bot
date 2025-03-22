const { ApplicationCommandOptionType, ApplicationCommandType } = require("discord.js");
const Cryptocurrencies = require("../../../handlers/functions/Economy/Cryptocurrencies");
const Profiles = require("../../../handlers/functions/Profiles");
const ImageGenerator = require("../../../handlers/functions/Images/Imagegenerator");

module.exports = {
    name: 'sell',
    description: '(🪙) Economy',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "montant",
            description: "Montant en crypto-monnaie.",
            type: ApplicationCommandOptionType.Number,
            required: true,
            min_value: 0.01,
        }
    ],
    execute: async (client, interaction, args, con) => {
        const current_profile = await Profiles.getProfile(interaction.user);
        const cryptoAmount = parseFloat(interaction.options.getNumber('montant')).toFixed(2);

        Cryptocurrencies.sellToken(interaction.user, cryptoAmount).then(async (res) => {
            const crypto_card = await ImageGenerator.CryptoSell(interaction, current_profile, cryptoAmount, res);

            await interaction.reply({
                files: [crypto_card],
            })
        })
    }
}