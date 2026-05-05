const { 
    ApplicationCommandType, 
    ApplicationCommandOptionType, 
    ButtonBuilder, 
    ActionRowBuilder, 
    ButtonStyle, 
    AttachmentBuilder
} = require('discord.js');
const DiceRenderer = require('../../../handlers/functions/Images/Commands/Dice');
const Utils = require('../../../handlers/functions/Utils');
const prisma = require('../../../handlers/database');

module.exports = {
    name: 'dice',
    description: '(🎲) Games',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "montant",
            description: "Montant à miser",
            type: ApplicationCommandOptionType.String,
            required: true,
        }
    ],
    execute: async (client, interaction, args) => {
        const amountInput = interaction.options.getString('montant');
        const bet = Utils.parseAmountInput(amountInput);
        const ANIMATION_FRAMES = 10;
        const ANIMATION_DELAY = 100;

        const _profile = await prisma.profile.findFirst({ where: { userId: interaction.user.id } });
        if (!_profile) return interaction.reply({ content: "Erreur de base de données", ephemeral: true });
        const userCoins = parseFloat(_profile.balance);
        if (bet > userCoins) {
            return interaction.reply({ content: "Fonds insuffisants", ephemeral: true });
        }

        {
            const rollButton = new ButtonBuilder()
                .setCustomId('roll')
                .setLabel('Lancer le dé')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🎲');

            const actionRow = new ActionRowBuilder().addComponents(rollButton);

            let initialRender;
            try {
                initialRender = await DiceRenderer(interaction, { bet, diceValue: 1, rolling: false });
            } catch (error) {
                console.error('Erreur de rendu:', error);
                return interaction.reply({ content: "Erreur lors du rendu du jeu de dés", ephemeral: true });
            }

            const initialAttachment = new AttachmentBuilder(initialRender.toBuffer(), { name: 'dice.png' });
            const message = await interaction.reply({ 
                content: `**JEU DE DÉS** - Mise: **${Utils.formatMoney(Number(bet))} €**`,
                files: [initialAttachment],
                components: [actionRow]
            });

            const collector = message.createMessageComponentCollector({ time: 60000 });

            collector.on('collect', async i => {
                if (i.user.id !== interaction.user.id) {
                    return i.reply({ content: "Ce n'est pas votre partie!", ephemeral: true });
                }

                rollButton.setDisabled(true);
                await i.update({ components: [new ActionRowBuilder().addComponents(rollButton)] });

                const newBalance = (userCoins - bet).toFixed(2);
                await prisma.profile.updateMany({
                    where: { userId: interaction.user.id },
                    data: { balance: parseFloat(newBalance) }
                });

                const animateRoll = async (frame) => {
                    if (frame >= ANIMATION_FRAMES) {
                        const diceValue = Math.floor(Math.random() * 6) + 1;
                        const isWin = diceValue >= 4;
                        const winAmount = isWin ? bet * 2 : 0;

                        const finalRender = await DiceRenderer(interaction, { bet, diceValue, winAmount, rolling: false });
                        const finalAttachment = new AttachmentBuilder(finalRender.toBuffer(), { name: 'dice.png' });
                        
                        if (isWin) {
                            const updatedBalance = (parseFloat(newBalance) + winAmount).toFixed(2);
                            await prisma.profile.updateMany({
                                where: { userId: interaction.user.id },
                                data: { balance: parseFloat(updatedBalance) }
                            });
                        }

                        const resultMessage = isWin 
                            ? `**GAGNÉ!** Vous avez fait ${diceValue} et gagné **${Utils.formatMoney(Number(winAmount))} €**`
                            : `**PERDU...** Vous avez fait ${diceValue}`;

                        collector.stop();
                        message.edit({
                            content: `${resultMessage}\nMise: **${Utils.formatMoney(Number(bet))} €**`,
                            files: [finalAttachment],
                        }).catch(console.error);
                        return;
                    }

                    const tempValue = Math.floor(Math.random() * 6) + 1;
                    const spinningRender = await DiceRenderer(interaction, { bet, diceValue: tempValue, rolling: true });
                    const spinningAttachment = new AttachmentBuilder(spinningRender.toBuffer(), { name: 'dice.png' });
                    await message.edit({ files: [spinningAttachment] });
                    setTimeout(() => animateRoll(frame + 1), ANIMATION_DELAY);
                };

                animateRoll(0);
            });

            collector.on('end', () => {
                message.edit({ components: [] }).catch(console.error);
            });
        }
    }
};