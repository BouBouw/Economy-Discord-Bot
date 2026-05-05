const { 
    ApplicationCommandType, 
    ApplicationCommandOptionType, 
    ButtonBuilder, 
    ActionRowBuilder, 
    ButtonStyle, 
    AttachmentBuilder,
} = require('discord.js');
const RouletteRenderer = require('../../../handlers/functions/Images/Commands/Roulette');
const Utils = require('../../../handlers/functions/Utils');
const prisma = require('../../../handlers/database');

module.exports = {
    name: 'roulette',
    description: '(🎲) Games',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "montant",
            description: "Montant à miser",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: "type",
            description: "Type de mise",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                { name: "Rouge", value: "red" },
                { name: "Noir", value: "black" },
                { name: "Pair", value: "even" },
                { name: "Impair", value: "odd" },
                { name: "1-18", value: "1to18" },
                { name: "19-36", value: "19to36" },
                { name: "1-12", value: "1to12" },
                { name: "13-24", value: "13to24" },
                { name: "25-36", value: "25to36" }
            ]
        }
    ],
    execute: async (client, interaction, args) => {
        const amountInput = interaction.options.getString('montant');
        const betType = interaction.options.getString('type');
        const bet = Utils.parseAmountInput(amountInput);
        const ANIMATION_FRAMES = 15;
        const ANIMATION_DELAY = 100;

        const _profile = await prisma.profile.findFirst({ where: { userId: interaction.user.id } });
        if (!_profile) return interaction.reply({ content: "Profil non trouvé", ephemeral: true });
        const userCoins = parseFloat(_profile.balance);
        if (bet > userCoins) {
            return interaction.reply({ content: "Fonds insuffisants", ephemeral: true });
        }

        {
            const spinButton = new ButtonBuilder()
                .setCustomId('spin')
                .setLabel('Faire tourner la roue')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🎰');

            const actionRow = new ActionRowBuilder().addComponents(spinButton);

            let initialRender;
            try {
                initialRender = await RouletteRenderer(interaction, { bet, bets: [{ type: betType, amount: bet }], spinning: false });
            } catch (error) {
                console.error('Erreur de rendu:', error);
                return interaction.reply({ content: "Erreur lors du rendu de la roulette", ephemeral: true });
            }

            const initialAttachment = new AttachmentBuilder(initialRender.toBuffer(), { name: 'roulette.png' });
            const message = await interaction.reply({ 
                content: `**ROULETTE** - Mise: **${Utils.formatMoney(Number(bet))} €** sur ${betType}`,
                files: [initialAttachment],
                components: [actionRow]
            });

            const collector = message.createMessageComponentCollector({ time: 60000 });

            collector.on('collect', async i => {
                if (i.user.id !== interaction.user.id) {
                    return i.reply({ content: "Ce n'est pas votre partie!", ephemeral: true });
                }

                spinButton.setDisabled(true);
                await i.update({ components: [new ActionRowBuilder().addComponents(spinButton)] });

                const newBalance = (userCoins - bet).toFixed(2);
                await prisma.profile.updateMany({
                    where: { userId: interaction.user.id },
                    data: { balance: parseFloat(newBalance) }
                });

                const animateSpin = async (frame) => {
                    if (frame >= ANIMATION_FRAMES) {
                        const winningNumber = Math.floor(Math.random() * 37);
                        const isWin = checkWin(betType, winningNumber);
                        const winAmount = isWin ? calculateWin(betType, bet) : 0;

                        const finalRender = await RouletteRenderer(interaction, {
                            bet, winAmount, winningNumber, spinning: false,
                            bets: [{ type: betType, amount: bet }]
                        });
                        const finalAttachment = new AttachmentBuilder(finalRender.toBuffer(), { name: 'roulette.png' });
                        
                        if (isWin) {
                            const updatedBalance = (parseFloat(newBalance) + winAmount).toFixed(2);
                            await prisma.profile.updateMany({
                                where: { userId: interaction.user.id },
                                data: { balance: parseFloat(updatedBalance) }
                            });
                        }

                        const resultMessage = isWin 
                            ? `**GAGNÉ!** Le numéro ${winningNumber} est sorti. Vous gagnez **${Utils.formatMoney(Number(winAmount))} €**`
                            : `**PERDU...** Le numéro ${winningNumber} est sorti.`;

                        collector.stop();
                        message.edit({
                            content: `${resultMessage}\nMise: **${Utils.formatMoney(Number(bet))} €**`,
                            files: [finalAttachment],
                            components: []
                        }).catch(console.error);
                        return;
                    }

                    const spinningRender = await RouletteRenderer(interaction, {
                        bet, spinning: true, bets: [{ type: betType, amount: bet }]
                    });
                    const spinningAttachment = new AttachmentBuilder(spinningRender.toBuffer(), { name: 'roulette.png' });
                    await message.edit({ files: [spinningAttachment] });
                    setTimeout(() => animateSpin(frame + 1), ANIMATION_DELAY);
                };

                animateSpin(0);
            });

            collector.on('end', () => {
                message.edit({ components: [] }).catch(console.error);
            });
        }

        function checkWin(betType, number) {
            const isRed = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(number);
            const isBlack = [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35].includes(number);
            
            switch(betType) {
                case 'red': return isRed;
                case 'black': return isBlack;
                case 'even': return number !== 0 && number % 2 === 0;
                case 'odd': return number % 2 === 1;
                case '1to18': return number >= 1 && number <= 18;
                case '19to36': return number >= 19 && number <= 36;
                case '1to12': return number >= 1 && number <= 12;
                case '13to24': return number >= 13 && number <= 24;
                case '25to36': return number >= 25 && number <= 36;
                default: return false;
            }
        }

        function calculateWin(betType, betAmount) {
            switch(betType) {
                case 'red':
                case 'black':
                case 'even':
                case 'odd':
                case '1to18':
                case '19to36':
                    return betAmount * 2;
                case '1to12':
                case '13to24':
                case '25to36':
                    return betAmount * 3;
                default:
                    return 0;
            }
        }
    }
};