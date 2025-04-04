const { 
    ApplicationCommandType, 
    ApplicationCommandOptionType, 
    ButtonBuilder, 
    ActionRowBuilder, 
    ButtonStyle, 
    AttachmentBuilder
} = require('discord.js');
const SlotMachineRenderer = require('../../../handlers/functions/Images/Commands/SlotMachine');
const Utils = require('../../../handlers/functions/Utils');

module.exports = {
    name: 'slot-machine',
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
    execute: (client, interaction, args, con) => {
        const amountInput = interaction.options.getString('montant');
        const bet = Utils.parseAmountInput(amountInput);

        const SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '🔔', '⭐', '7️⃣', '💰'];
        const MULTIPLIERS = [2, 3, 4, 5, 10, 15, 20, 50];
        const ANIMATION_FRAMES = 10;
        const ANIMATION_DELAY = 100;

        con.query(`SELECT balance FROM profiles WHERE user_id = ?`, [interaction.user.id], (err, result) => {
            if (err) {
                console.error('Erreur SQL:', err);
                return interaction.reply({ content: "Erreur de base de données", ephemeral: true });
            }

            if (result.length === 0) {
                return interaction.reply({ content: "Profil non trouvé", ephemeral: true });
            }

            const userCoins = parseFloat(result[0].balance);
            if (bet > userCoins) {
                return interaction.reply({ content: "Fonds insuffisants", ephemeral: true });
            }

            const spinButton = new ButtonBuilder()
                .setCustomId('spin')
                .setLabel('Tourner la machine')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🎰');

            const actionRow = new ActionRowBuilder().addComponents(spinButton);

            SlotMachineRenderer(interaction, {
                reels: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
                bet,
                symbols: SYMBOLS
            }).then(initialRender => {
                const initialAttachment = new AttachmentBuilder(initialRender.toBuffer(), { name: 'slot.png' });

                interaction.reply({ 
                    content: `**MACHINE À SOUS** - Mise: **${Utils.formatMoney(Number(bet))}**`,
                    files: [initialAttachment],
                    components: [actionRow]
                }).then(message => {
                    const collector = message.createMessageComponentCollector({ time: 60000 });

                    collector.on('collect', i => {
                        if (i.user.id !== interaction.user.id) {
                            return i.reply({ content: "Ce n'est pas votre partie!", ephemeral: true });
                        }

                        spinButton.setDisabled(true);
                        i.update({
                            components: [new ActionRowBuilder().addComponents(spinButton)]
                        }).then(() => {
                            const newBalance = (userCoins - bet).toFixed(2);
                            con.query(`UPDATE profiles SET balance = ? WHERE user_id = ?`, [newBalance, interaction.user.id]);

                            const animateSpin = (frame) => {
                                if (frame >= ANIMATION_FRAMES) {
                                    const finalReels = generateReels();
                                    const winAmount = calculateWin(finalReels, bet);

                                    SlotMachineRenderer(interaction, {
                                        reels: finalReels,
                                        bet,
                                        winAmount,
                                        symbols: SYMBOLS
                                    }).then(finalRender => {
                                        const finalAttachment = new AttachmentBuilder(finalRender.toBuffer(), { name: 'slot.png' });
                                        
                                        if (winAmount > 0) {
                                            const updatedBalance = (parseFloat(newBalance) + winAmount).toFixed(2);
                                            con.query(`UPDATE profiles SET balance = ? WHERE user_id = ?`, [updatedBalance, interaction.user.id]);
                                        }

                                        const resultMessage = winAmount > 0 
                                            ? `**GAGNÉ!** +${Utils.formatMoney(Number(winAmount))} (x${winAmount / bet})`
                                            : "**Perdu...** Essayez encore!";

                                        collector.stop();
                                        message.edit({
                                            content: `**RÉSULTAT** - ${resultMessage}\nMise: **${Utils.formatMoney(Number(bet))}**`,
                                            files: [finalAttachment],
                                            components: []
                                        }).catch(console.error);
                                    });
                                    return;
                                }

                                const spinningReels = generateReels();
                                SlotMachineRenderer(interaction, {
                                    reels: spinningReels,
                                    spinning: true,
                                    bet,
                                    symbols: SYMBOLS
                                }).then(spinningRender => {
                                    const spinningAttachment = new AttachmentBuilder(spinningRender.toBuffer(), { name: 'slot.png' });
                                    
                                    message.edit({
                                        files: [spinningAttachment]
                                    }).then(() => {
                                        setTimeout(() => {
                                            animateSpin(frame + 1);
                                        }, ANIMATION_DELAY + frame * 50);
                                    });
                                });
                            };

                            animateSpin(0);
                        });
                    });

                    collector.on('end', () => {
                        message.edit({ components: [] }).catch(console.error);
                    });
                });
            }).catch(error => {
                console.error('Erreur de rendu:', error);
                interaction.reply({ content: "Erreur lors du rendu de la machine à sous", ephemeral: true });
            });
        });

        function randomSymbol() {
            return Math.floor(Math.random() * 8);
        }

        function generateReels() {
            const reels = [
                [randomSymbol(), randomSymbol(), randomSymbol()],
                [randomSymbol(), randomSymbol(), randomSymbol()],
                [randomSymbol(), randomSymbol(), randomSymbol()]
            ];
            return reels;
        }

        function calculateWin(reels, betAmount) {
            const middleLine = [reels[0][1], reels[1][1], reels[2][1]];
            
            if (new Set(middleLine).size === 1) {
                return betAmount * MULTIPLIERS[middleLine[0]];
            }
            
            return 0;
        }
    }
};