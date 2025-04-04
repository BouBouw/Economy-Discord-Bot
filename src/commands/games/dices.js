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

module.exports = {
    name: 'dice',
    description: '(🎲) Jeu de dés',
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

            const rollButton = new ButtonBuilder()
                .setCustomId('roll')
                .setLabel('Lancer les dés')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🎲');

            const actionRow = new ActionRowBuilder().addComponents(rollButton);

            DiceRenderer(interaction, {
                bet,
                diceValue: 1,
                rolling: false
            }).then(initialRender => {
                const initialAttachment = new AttachmentBuilder(initialRender.toBuffer(), { name: 'dice.png' });

                interaction.reply({ 
                    content: `**JEU DE DÉS** - Mise: **${Utils.formatMoney(Number(bet))}**`,
                    files: [initialAttachment],
                    components: [actionRow]
                }).then(message => {
                    const collector = message.createMessageComponentCollector({ time: 60000 });

                    collector.on('collect', i => {
                        if (i.user.id !== interaction.user.id) {
                            return i.reply({ content: "Ce n'est pas votre partie!", ephemeral: true });
                        }

                        rollButton.setDisabled(true);
                        i.update({
                            components: [new ActionRowBuilder().addComponents(rollButton)]
                        }).then(() => {
                            const newBalance = (userCoins - bet).toFixed(2);
                            con.query(`UPDATE profiles SET balance = ? WHERE user_id = ?`, [newBalance, interaction.user.id]);

                            const animateRoll = (frame) => {
                                if (frame >= ANIMATION_FRAMES) {
                                    const diceValue = Math.floor(Math.random() * 6) + 1;
                                    const isWin = diceValue >= 4;
                                    const winAmount = isWin ? bet * 2 : 0;

                                    DiceRenderer(interaction, {
                                        bet,
                                        diceValue,
                                        winAmount,
                                        rolling: false
                                    }).then(finalRender => {
                                        const finalAttachment = new AttachmentBuilder(finalRender.toBuffer(), { name: 'dice.png' });
                                        
                                        if (isWin) {
                                            const updatedBalance = (parseFloat(newBalance) + winAmount).toFixed(2);
                                            con.query(`UPDATE profiles SET balance = ? WHERE user_id = ?`, [updatedBalance, interaction.user.id]);
                                        }

                                        const resultMessage = isWin 
                                            ? `**GAGNÉ!** Vous avez fait ${diceValue} et gagné ${Utils.formatMoney(Number(winAmount))}`
                                            : `**PERDU...** Vous avez fait ${diceValue}`;

                                        const newRow = new ActionRowBuilder()
                                            .addComponents(
                                                new ButtonBuilder()
                                                    .setCustomId('reroll')
                                                    .setLabel('Relancer')
                                                    .setStyle(ButtonStyle.Primary),
                                                new ButtonBuilder()
                                                    .setCustomId('quit')
                                                    .setLabel('Quitter')
                                                    .setStyle(ButtonStyle.Danger)
                                            );

                                        collector.stop();
                                        message.edit({
                                            content: `**RÉSULTAT** - ${resultMessage}\nMise: **${Utils.formatMoney(Number(bet))}**`,
                                            files: [finalAttachment],
                                            components: [newRow]
                                        }).then(() => {
                                            const newCollector = message.createMessageComponentCollector({ time: 30000 });

                                            newCollector.on('collect', async newI => {
                                                if (newI.customId === 'reroll') {
                                                    await newI.deferUpdate();
                                                    newCollector.stop();
                                                    return collector.emit('collect', i);
                                                } else if (newI.customId === 'quit') {
                                                    await newI.deferUpdate();
                                                    newCollector.stop();
                                                    return message.edit({ components: [] });
                                                }
                                            });
                                        }).catch(console.error);
                                    });
                                    return;
                                }

                                const tempValue = Math.floor(Math.random() * 6) + 1;
                                DiceRenderer(interaction, {
                                    bet,
                                    diceValue: tempValue,
                                    rolling: true
                                }).then(spinningRender => {
                                    const spinningAttachment = new AttachmentBuilder(spinningRender.toBuffer(), { name: 'dice.png' });
                                    
                                    message.edit({
                                        files: [spinningAttachment]
                                    }).then(() => {
                                        setTimeout(() => {
                                            animateRoll(frame + 1);
                                        }, ANIMATION_DELAY);
                                    });
                                });
                            };

                            animateRoll(0);
                        });
                    });

                    collector.on('end', () => {
                        message.edit({ components: [] }).catch(console.error);
                    });
                });
            }).catch(error => {
                console.error('Erreur de rendu:', error);
                interaction.reply({ content: "Erreur lors du rendu du jeu de dés", ephemeral: true });
            });
        });
    }
};