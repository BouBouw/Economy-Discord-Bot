case 7: {
    const players = gameTable.map((member) => ({
        id: member.userID,
        name: member.user.tag,
        coins: 1000,
        hand: [],
        isFolded: false,
        currentBet: 0
    }));

    let pot = 0;
    let currentPlayerIndex = 0;
    let currentBet = 0;

    function dealCards() {
        const deck = createDeck();
        shuffleDeck(deck);

        players.forEach((player) => {
            player.hand = [deck.pop(), deck.pop()];
        });
    }

    function createDeck() {
        const suits = ['♥', '♦', '♣', '♠'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        const deck = [];

        for (const suit of suits) {
            for (const value of values) {
                deck.push({ suit, value });
            }
        }

        return deck;
    }

    function shuffleDeck(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }

    function displayPlayerHand(player) {
        return player.hand.map(card => `${card.value}${card.suit}`).join(' ');
    }

    function startRound() {
        dealCards();
        channel.send("🎴 Les cartes ont été distribuées !");

        players.forEach((player) => {
            channel.send(`🃏 ${player.name} : ${displayPlayerHand(player)}`);
        });

        startBettingRound();
    }

    function startBettingRound() {
        const currentPlayer = players[currentPlayerIndex];

        if (currentPlayer.isFolded) {
            nextPlayer();
            return;
        }

        channel.send({
            content: `💸 C'est au tour de <@${currentPlayer.id}> de miser. Mise actuelle : ${currentBet} 🪙`,
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('call').setLabel('Suivre').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('raise').setLabel('Relancer').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId('fold').setLabel('Se coucher').setStyle(ButtonStyle.Danger)
                )
            ]
        }).then((message) => {
            const filter = (i) => i.user.id === currentPlayer.id;
            const collector = message.createMessageComponentCollector({ filter, time: 30000 });

            collector.on('collect', async (interaction) => {
                await interaction.deferUpdate();

                switch (interaction.customId) {
                    case 'call':
                        currentPlayer.coins -= currentBet;
                        pot += currentBet;
                        channel.send(`<@${currentPlayer.id}> suit la mise.`);
                        collector.stop();
                        nextPlayer();
                        break;

                    case 'raise':
                        channel.send(`<@${currentPlayer.id}>, combien souhaitez-vous relancer ? Répondez avec un nombre.`);

                        const messageFilter = (m) => m.author.id === currentPlayer.id && !isNaN(m.content) && parseInt(m.content) > 0;
                        const messageCollector = channel.createMessageCollector({ filter: messageFilter, time: 30000 });

                        messageCollector.on('collect', (m) => {
                            const raiseAmount = parseInt(m.content);

                            if (raiseAmount > currentPlayer.coins) {
                                channel.send(`<@${currentPlayer.id}>, vous n'avez pas assez de jetons pour relancer de ${raiseAmount} 🪙.`);
                                return;
                            }

                            currentPlayer.coins -= raiseAmount;
                            pot += raiseAmount;
                            currentBet += raiseAmount;
                            channel.send(`<@${currentPlayer.id}> relance de ${raiseAmount} 🪙.`);

                            messageCollector.stop();
                            collector.stop();

                            nextPlayer();
                        });

                        messageCollector.on('end', (collected) => {
                            if (collected.size === 0) {
                                channel.send(`<@${currentPlayer.id}>, vous n'avez pas saisi de montant valide. La relance est annulée.`);
                                collector.stop();
                                nextPlayer();
                            }
                        });
                        break;

                    case 'fold':
                        currentPlayer.isFolded = true;
                        channel.send(`<@${currentPlayer.id}> se couche.`);
                        collector.stop();
                        nextPlayer();
                        break;
                }
            });

            collector.on('end', () => {
                message.delete();
            });
        });
    }

    function nextPlayer() {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;

        if (currentPlayerIndex === 0) {
            endBettingRound();
        } else {
            startBettingRound();
        }
    }

    function endBettingRound() {
        channel.send("✅ Le tour de mise est terminé. Le pot est maintenant de " + pot + " 🪙.");
    
        const communityCards = [];
    
        function revealCommunityCards(count) {
            const deck = createDeck();
            shuffleDeck(deck);
    
            players.forEach(player => {
                player.hand.forEach(card => {
                    const index = deck.findIndex(c => c.suit === card.suit && c.value === card.value);
                    if (index !== -1) deck.splice(index, 1);
                });
            });
    
            for (let i = 0; i < count; i++) {
                communityCards.push(deck.pop());
            }
    
            channel.send(`🃏 Cartes communes : ${communityCards.map(card => `${card.value}${card.suit}`).join(' ')}`);
        }
    
        function startNextBettingRound() {
            currentPlayerIndex = 0;
            currentBet = 0;
            startBettingRound();
        }
    
        if (communityCards.length === 0) {
            channel.send("🃏 **Flop** : 3 cartes sont révélées.");
            revealCommunityCards(3);
            startNextBettingRound();
        } else if (communityCards.length === 3) {
            channel.send("🃏 **Turn** : 1 carte supplémentaire est révélée.");
            revealCommunityCards(1);
            startNextBettingRound();
        } else if (communityCards.length === 4) {
            channel.send("🃏 **River** : 1 dernière carte est révélée.");
            revealCommunityCards(1);
            startNextBettingRound();
        } else if (communityCards.length === 5) {
            endGame();
        }
    }
    
    function endGame() {
        channel.send("🎉 Toutes les cartes sont révélées. Détermination du gagnant...");
    
        const results = players.map(player => {
            if (player.isFolded) {
                return { player, handStrength: 0 };
            }
    
            const allCards = [...player.hand, ...communityCards];
            const handStrength = evaluateHand(allCards);
    
            return { player, handStrength };
        });
    
        const winner = results.reduce((prev, current) => {
            return (current.handStrength > prev.handStrength) ? current : prev;
        });
    
        if (winner.handStrength > 0) {
            channel.send(`🏆 <@${winner.player.id}> remporte le pot de ${pot} 🪙 avec la main : ${displayHand(winner.player.hand)}`);
    
            let xpWin = 200, coinsWin = pot;
            let xpLose = 50, coinsLose = 20;
    
            UpdateUserStats(winner.player.id, true, xpWin, coinsWin);
    
            players.forEach(player => {
                if (player.id !== winner.player.id) {
                    UpdateUserStats(player.id, false, xpLose, coinsLose);
                }
            });
    
        } else {
            channel.send("❌ Aucun gagnant, tous les joueurs se sont couchés.");
            players.forEach(player => {
                if (player.id !== winner.player.id) {
                    UpdateUserStats(player.id, null, 0, 15);
                }
            });
        }
    
        EndGameTable(gameHost, gameTable, guild);
        resetGame();
    }
    
    
    function evaluateHand(cards) {
        const valueCounts = {};
        const suitCounts = {};
        const values = cards.map(card => card.value);
        const suits = cards.map(card => card.suit);
    
        values.forEach(value => {
            valueCounts[value] = (valueCounts[value] || 0) + 1;
        });
    
        suits.forEach(suit => {
            suitCounts[suit] = (suitCounts[suit] || 0) + 1;
        });
    
        // Fonction pour vérifier si les valeurs forment une quinte (suite)
        const isStraight = () => {
            const uniqueValues = [...new Set(values)];
            if (uniqueValues.length < 5) return false;
    
            // Convertir les valeurs en numéros pour faciliter la comparaison
            const valueToNumber = {
                '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
                '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
            };
    
            const numericValues = uniqueValues.map(value => valueToNumber[value]).sort((a, b) => a - b);
    
            // Vérifier si les valeurs forment une suite
            for (let i = 0; i < numericValues.length - 4; i++) {
                if (numericValues[i + 4] - numericValues[i] === 4) {
                    return true;
                }
            }
    
            // Cas spécial pour la quinte A-2-3-4-5
            if (numericValues.includes(14) && numericValues.includes(2) && numericValues.includes(3) &&
                numericValues.includes(4) && numericValues.includes(5)) {
                return true;
            }
    
            return false;
        };
    
        // Fonction pour vérifier si les cartes forment une couleur (5 cartes de la même couleur)
        const isFlush = () => {
            return Object.values(suitCounts).some(count => count >= 5);
        };
    
        // Fonction pour vérifier si les cartes forment une quinte flush (suite + couleur)
        const isStraightFlush = () => {
            return isStraight() && isFlush();
        };
    
        // Fonction pour vérifier si les cartes forment un carré (4 cartes de la même valeur)
        const isFourOfAKind = () => {
            return Object.values(valueCounts).some(count => count === 4);
        };
    
        // Fonction pour vérifier si les cartes forment un full house (brelan + paire)
        const isFullHouse = () => {
            return Object.values(valueCounts).some(count => count === 3) &&
                   Object.values(valueCounts).some(count => count === 2);
        };
    
        // Fonction pour vérifier si les cartes forment un brelan (3 cartes de la même valeur)
        const isThreeOfAKind = () => {
            return Object.values(valueCounts).some(count => count === 3);
        };
    
        // Fonction pour vérifier si les cartes forment deux paires
        const isTwoPair = () => {
            return Object.values(valueCounts).filter(count => count === 2).length >= 2;
        };
    
        // Fonction pour vérifier si les cartes forment une paire
        const isPair = () => {
            return Object.values(valueCounts).some(count => count === 2);
        };
    
        // Déterminer la force de la main
        if (isStraightFlush()) return 9; // Quinte flush
        if (isFourOfAKind()) return 8; // Carré
        if (isFullHouse()) return 7; // Full house
        if (isFlush()) return 6; // Couleur
        if (isStraight()) return 5; // Quinte
        if (isThreeOfAKind()) return 4; // Brelan
        if (isTwoPair()) return 3; // Deux paires
        if (isPair()) return 2; // Paire
        return 1; // Carte haute
    }
    
    function displayHand(hand) {
        return hand.map(card => `${card.value}${card.suit}`).join(' ');
    }
    
    function resetGame() {
        players.forEach(player => {
            player.hand = [];
            player.isFolded = false;
            player.currentBet = 0;
        });
        pot = 0;
        communityCards.length = 0;
        currentPlayerIndex = 0;
        currentBet = 0;
    
        EndGameTable(gameHost, gameTable, guild);
    }

    startRound();

    break;
}