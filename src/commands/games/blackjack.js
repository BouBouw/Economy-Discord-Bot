const { 
    ApplicationCommandType, 
    ApplicationCommandOptionType, 
    ButtonBuilder, 
    ActionRowBuilder, 
    ButtonStyle, 
    AttachmentBuilder
} = require('discord.js');
const BlackjackRenderer = require('../../../handlers/functions/Images/Commands/Blackjack');
const Utils = require('../../../handlers/functions/Utils');

module.exports = {
    name: 'blackjack',
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

        const createDeck = () => {
            const suits = ['S', 'H', 'D', 'C'];
            const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
            return suits.flatMap(suit => ranks.map(rank => ({ suit, rank })));
        };

        const shuffleDeck = (deck) => {
            for (let i = deck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [deck[i], deck[j]] = [deck[j], deck[i]];
            }
            return deck;
        };

        const calculateScore = (hand) => {
            let score = 0;
            let aces = 0;
            
            for (const card of hand) {
                score += card.rank === 'A' ? 11 : 
                        ['K','Q','J','10'].includes(card.rank) ? 10 : 
                        parseInt(card.rank);
                if (card.rank === 'A') aces++;
            }
            
            while (score > 21 && aces > 0) {
                score -= 10;
                aces--;
            }
            
            return score;
        };

        // Vérification du profil
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

            // Initialisation du jeu
            let deck = [];
            for (let i = 0; i < 6; i++) deck = deck.concat(createDeck());
            deck = shuffleDeck(deck);

            const drawCard = () => {
                if (deck.length === 0) {
                    for (let i = 0; i < 6; i++) deck = deck.concat(createDeck());
                    deck = shuffleDeck(deck);
                }
                return deck.pop();
            };

            const playerHand = [drawCard(), drawCard()];
            const dealerHand = [drawCard(), drawCard()];

            // Rendu initial
            BlackjackRenderer(interaction, {
                playerHand,
                dealerHand,
                bet,
                showDealerCards: false
            }).then(renderResult => {
                const attachment = new AttachmentBuilder(renderResult.canvas.toBuffer(), { name: 'blackjack.png' });

                const hitButton = new ButtonBuilder()
                    .setCustomId('hit')
                    .setLabel('Tirer')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🃏');

                const standButton = new ButtonBuilder()
                    .setCustomId('stand')
                    .setLabel('Rester')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('✋');

                const doubleButton = new ButtonBuilder()
                    .setCustomId('double')
                    .setLabel('Double')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('💰')
                    .setDisabled(bet * 2 > userCoins);

                const actionRow = new ActionRowBuilder().addComponents(hitButton, standButton, doubleButton);

                interaction.reply({ 
                    content: `**BLACKJACK** - Mise: **${Utils.formatMoney(Number(bet))}**`,
                    files: [attachment],
                    components: [actionRow]
                }).then(message => {
                    const collector = message.createMessageComponentCollector({ time: 60000 });

                    collector.on('collect', async i => {
                        if (i.user.id !== interaction.user.id) {
                            return i.reply({ content: "Ce n'est pas votre partie!", ephemeral: true });
                        }
                    
                        await i.deferUpdate();
                        
                        let gameOver = false;
                        let winnings = 0;
                        let resultMessage = "";
                        let updatedBet = parseFloat(bet);
                        let currentDealerScore = calculateScore(dealerHand);
                    
                        if (i.customId === 'hit') {
                            playerHand.push(drawCard());
                            const playerScore = calculateScore(playerHand);
                            
                            if (playerScore > 21) {
                                gameOver = true;
                                winnings = -updatedBet;
                                resultMessage = "**Dépassement!** Vous perdez votre mise.";
                            }
                        } 
                        else if (i.customId === 'stand' || i.customId === 'double') {
                            if (i.customId === 'double') {
                                updatedBet = bet * 2;
                                playerHand.push(drawCard());
                            }
                            
                            gameOver = true;
                            
                            // Le croupier joue
                            while (currentDealerScore < 17) {
                                dealerHand.push(drawCard());
                                currentDealerScore = calculateScore(dealerHand);
                            }
                    
                            const playerScore = calculateScore(playerHand);
                            const isBlackjack = playerScore === 21 && (i.customId === 'double' ? playerHand.length === 3 : playerHand.length === 2);
                            
                            if (currentDealerScore > 21 || playerScore > currentDealerScore) {
                                winnings = updatedBet * (isBlackjack ? 2.5 : 2);
                                resultMessage = `${isBlackjack ? '**Blackjack!** ' : ''}Vous gagnez **${Utils.formatMoney(Number(winnings))}**`;
                            } else if (playerScore < currentDealerScore) {
                                winnings = -updatedBet;
                                resultMessage = `Le croupier gagne. Vous perdez **${Utils.formatMoney(Number(updatedBet))}**`;
                            } else {
                                resultMessage = "**Égalité!** Vous récupérez votre mise.";
                            }
                        }
                    
                        // Rendu du jeu
                        const finalRender = await BlackjackRenderer(interaction, {
                            playerHand,
                            dealerHand,
                            bet: updatedBet,
                            showDealerCards: gameOver,
                            gameResult: resultMessage,
                            winnings
                        });
                    
                        const finalAttachment = new AttachmentBuilder(finalRender.canvas.toBuffer(), { name: 'blackjack.png' });
                    
                        if (gameOver) {
                            // Mise à jour de la base de données
                            const newCoins = (userCoins + winnings).toFixed(2);
                            con.query(
                                `UPDATE profiles SET balance = ? WHERE user_id = ?`, 
                                [newCoins, interaction.user.id],
                                (err) => {
                                    if (err) console.error('Erreur SQL:', err);
                                }
                            );
                    
                            collector.stop();
                            await i.editReply({
                                content: `**RÉSULTAT** - ${resultMessage}\nMise: **${Utils.formatMoney(Number(updatedBet))}**`,
                                files: [finalAttachment],
                                components: []
                            });
                        } else {
                            await i.editReply({
                                content: `**BLACKJACK** - Score actuel: **${calculateScore(playerHand)}**\nMise: **${Utils.formatMoney(Number(updatedBet))}**`,
                                files: [finalAttachment],
                                components: [actionRow]
                            });
                        }
                    });

                    collector.on('end', () => {
                        message.edit({ components: [] }).catch(console.error);
                    });
                });
            });
        });
    }
};