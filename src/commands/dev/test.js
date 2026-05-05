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
const prisma = require('../../../handlers/database');

module.exports = {
    name: 'dev',
    description: '(🎰) Casino - Jouez à la machine à sous',
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

        // Configuration des symboles et multiplicateurs
        const SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '🔔', '⭐', '7️⃣', '💰'];
        const MULTIPLIERS = [2, 3, 4, 5, 10, 15, 20, 50];
        const ANIMATION_FRAMES = 10;
        const ANIMATION_DELAY = 100; // ms

        // Vérification du profil
        const _profile = await prisma.profile.findFirst({ where: { userId: interaction.user.id } });
        if (!_profile) return interaction.reply({ content: "Erreur de base de données", ephemeral: true });
        const userCoins = parseFloat(_profile.balance);
        if (bet > userCoins) {
            return interaction.reply({ content: "Fonds insuffisants", ephemeral: true });
        }

        {
            // Préparation de l'interface
            const spinButton = new ButtonBuilder()
                .setCustomId('spin')
                .setLabel('Tourner la machine')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🎰');

            const actionRow = new ActionRowBuilder().addComponents(spinButton);

            // Rendu initial
            let initialRender;
            try {
                initialRender = await SlotMachineRenderer(interaction, {
                    reels: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
                    bet,
                    symbols: SYMBOLS
                });
            } catch (error) {
                console.error('Erreur de rendu:', error);
                return interaction.reply({ content: "Erreur lors du rendu de la machine à sous", ephemeral: true });
            }

            const initialAttachment = new AttachmentBuilder(initialRender.toBuffer(), { name: 'slot.png' });
            const message = await interaction.reply({ 
                content: `**MACHINE À SOUS** - Mise: **${Utils.formatMoney(Number(bet))}**`,
                files: [initialAttachment],
                components: [actionRow]
            });

            const collector = message.createMessageComponentCollector({ time: 60000 });

            collector.on('collect', async i => {
                if (i.user.id !== interaction.user.id) {
                    return i.reply({ content: "Ce n'est pas votre partie!", ephemeral: true });
                }

                // Désactivation du bouton pendant l'animation
                spinButton.setDisabled(true);
                await i.update({
                    components: [new ActionRowBuilder().addComponents(spinButton)]
                });

                // Débit immédiat du solde
                const newBalance = (userCoins - bet).toFixed(2);
                await prisma.profile.updateMany({
                    where: { userId: interaction.user.id },
                    data: { balance: parseFloat(newBalance) }
                });

                // Fonction d'animation récursive
                const animateSpin = async (frame) => {
                    if (frame >= ANIMATION_FRAMES) {
                        // Animation terminée, résultat final
                        const finalReels = generateReels();
                        const winAmount = calculateWin(finalReels, bet);

                        const finalRender = await SlotMachineRenderer(interaction, {
                            reels: finalReels,
                            bet,
                            winAmount,
                            symbols: SYMBOLS
                        });
                        const finalAttachment = new AttachmentBuilder(finalRender.toBuffer(), { name: 'slot.png' });
                        
                        // Mise à jour du solde si gain
                        if (winAmount > 0) {
                            const updatedBalance = (parseFloat(newBalance) + winAmount).toFixed(2);
                            await prisma.profile.updateMany({
                                where: { userId: interaction.user.id },
                                data: { balance: parseFloat(updatedBalance) }
                            });
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
                        return;
                    }

                    // Frame d'animation
                    const spinningReels = generateReels();
                    const spinningRender = await SlotMachineRenderer(interaction, {
                        reels: spinningReels,
                        spinning: true,
                        bet,
                        symbols: SYMBOLS
                    });
                    const spinningAttachment = new AttachmentBuilder(spinningRender.toBuffer(), { name: 'slot.png' });
                    
                    await message.edit({ files: [spinningAttachment] });
                    setTimeout(() => animateSpin(frame + 1), ANIMATION_DELAY + frame * 50);
                };

                // Lancement de l'animation
                animateSpin(0);
            });

            collector.on('end', () => {
                message.edit({ components: [] }).catch(console.error);
            });
        }

        // Fonctions utilitaires
        function randomSymbol() {
            // Génère un nombre entre 0 et 7 inclus
            return Math.floor(Math.random() * 8);
        }

        function generateReels() {
            const reels = [
                [randomSymbol(), randomSymbol(), randomSymbol()],
                [randomSymbol(), randomSymbol(), randomSymbol()],
                [randomSymbol(), randomSymbol(), randomSymbol()]
            ];
            console.log("Reels générés:", reels);
            return reels;
        }

        function calculateWin(reels, betAmount) {
            // Vérification de la ligne du milieu
            const middleLine = [reels[0][1], reels[1][1], reels[2][1]];
            
            // 3 symboles identiques
            if (new Set(middleLine).size === 1) {
                return betAmount * MULTIPLIERS[middleLine[0]];
            }
            
            return 0;
        }
    }
};