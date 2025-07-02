case 4: {
    const wordsList = [
        "Montagne", "Rivière", "Forêt", "Océan", "Désert",
        "Plage", "Volcan", "Grotte", "Jungle", "Île",
        "Glacier", "Canyon", "Ciel", "Vallée", "Péninsule",
        "Planète", "Étoile", "Lune", "Soleil", "Galaxie",
        "Médecin", "Pompier", "Policier", "Espion", "Magicien",
        "Cinéma", "Théâtre", "Peinture", "Danse", "Musique",
        "Ordinateur", "Téléphone", "Robot", "Électricité", "Microphone",
        "Marteau", "Tournevis", "Clé", "Cadenas", "Scie",
        "Avion", "Voiture", "Bateau", "Train", "Hélicoptère",
        "Épée", "Bouclier", "Canon", "Pistolet", "Bombe",
        "Arbre", "Fleurs", "Herbe", "Feuille", "Racine",
        "Fantôme", "Monstre", "Vampire", "Sorcier", "Ombre",
        "Horloge", "Calendrier", "Passé", "Présent", "Futur",
        "Or", "Diamant", "Rubis", "Saphir", "Argent",
        "Cartes", "Échec", "Domino", "Puzzle", "Dames",
        "Pomme", "Orange", "Banane", "Pastèque", "Raisin"
    ];

    let words = [];
    let teams = { rouge: [], bleu: [] };
    let masterSpies = { rouge: null, bleu: null };
    let scores = { rouge: 0, bleu: 0 };
    let turn = "rouge";
    let players = gameTable.map(member => member.userID);
    let timeout;
    let gameMessage;

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function formTeams() {
        let shuffledPlayers = shuffleArray([...players]);
        let half = Math.floor(shuffledPlayers.length / 2);
    
        teams.rouge = shuffledPlayers.slice(0, half);
        teams.bleu = shuffledPlayers.slice(half);
    
        if (teams.rouge.length > teams.bleu.length) {
            teams.bleu.push(teams.rouge.pop());
        }
    
        masterSpies.rouge = teams.rouge.pop();
        masterSpies.bleu = teams.bleu.pop();
    }

    async function startGame() {
        await channel.send({
            content: `${players.map(player => `<@${player.id}>`).join(', ')}\nLa partie commence dans **10 secondes** !`,
        })
    
        setTimeout(async () => {
            formTeams();
    
            words = shuffleArray(wordsList).slice(0, 25).map((word, index) => ({
                text: word,
                type: index < 9 ? "rouge" : index < 17 ? "bleu" : index < 24 ? "neutre" : "assassin",
                revealed: false
            }));
    
            await channel.send(`🎲 **CodeNames** commence !\n\n🔴 **Équipe Rouge** : ${teams.rouge.map(p => `<@${p}>`).join(', ')}\n🔵 **Équipe Bleue** : ${teams.bleu.map(p => `<@${p}>`).join(', ')}\n🕵️ **Maîtres Espions**\n🔴 <@${masterSpies.rouge}>\n🔵 <@${masterSpies.bleu}>\n🎯 **L'équipe rouge commence !**`);
    
            await sendWordGrid();
            await nextTurn();
        }, 10000); // 10 secondes d'attente
    }

    async function sendWordGrid() {
        let buttons = [];
        for (let i = 0; i < words.length; i += 5) {
            let row = new ActionRowBuilder();
            words.slice(i, i + 5).forEach(word => {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(word.text)
                        .setLabel(word.revealed ? `✅ ${word.text}` : word.text)
                        .setStyle(word.revealed ? ButtonStyle.Secondary : ButtonStyle.Primary)
                        .setDisabled(word.revealed)
                );
            });
            buttons.push(row);
        }
    
        if (gameMessage) {
            await gameMessage.edit({ content: `📜 **Grille de mots :**`, components: buttons });
        } else {
            gameMessage = await channel.send({ content: `📜 **Grille de mots :**`, components: buttons });
        }
    }

    async function nextTurn() {
        let currentSpy = masterSpies[turn];
        await channel.send(`🔴🔵 **C'est au tour de <@${currentSpy}> de donner un indice !**\n⏳ **60 secondes**`);
    
        timeout = setTimeout(() => {
            channel.send(`⏳ **Temps écoulé !** L'équipe ${turn} perd son tour.`);
            turn = turn === "rouge" ? "bleu" : "rouge";
            nextTurn();
        }, 60000);
    }

    async function handleGuess(interaction) {
        if (!interaction.isButton()) return;
        if (!teams[turn].includes(interaction.user.id)) return interaction.reply({ content: "❌ Ce n'est pas ton tour !", ephemeral: true });
    
        clearTimeout(timeout);
    
        let word = words.find(w => w.text === interaction.customId);
        if (!word || word.revealed) return;
    
        word.revealed = true;
    
        if (word.type === "assassin") {
            await channel.send(`💀 <@${interaction.user.id}> a choisi **${word.text}** qui était l'ASSASSIN !\n❌ **L'équipe ${turn} perd immédiatement !**`);
            scores[turn === "rouge" ? "bleu" : "rouge"]++;
            return await checkWinner();
        }
    
        if (word.type === turn) {
            await channel.send(`✅ <@${interaction.user.id}> a trouvé **${word.text}** !`);
            if (words.filter(w => w.type === turn && !w.revealed).length === 0) {
                await channel.send(`🎉 **L'équipe ${turn} a trouvé tous ses mots et remporte la manche !**`);
                scores[turn]++;
                return await checkWinner();
            }
        } else {
            await channel.send(`❌ <@${interaction.user.id}> a choisi **${word.text}** qui n'appartient pas à son équipe.`);
            turn = turn === "rouge" ? "bleu" : "rouge";
        }
    
        await sendWordGrid();
        await nextTurn();
    }

    async function checkWinner() {
        await channel.send(`🏆 **Scores :**\n🔴 **Rouge** : ${scores.rouge} points\n🔵 **Bleu** : ${scores.bleu} points`);
    
        if (scores.rouge >= 5 || scores.bleu >= 5) {
            let winningTeam = scores.rouge >= 5 ? "rouge" : "bleu";
            await channel.send(`🎉 **L'équipe ${winningTeam} remporte la partie ! 🏆**`);
            return await endGame();
        } else {
            await startGame();
        }
    }

    async function endGame() {
        await channel.send("🎮 **Fin du CodeNames ! Merci d'avoir joué !**");
    
        let winningTeam = scores.rouge >= 5 ? "rouge" : "bleu";
        let losingTeam = winningTeam === "rouge" ? "bleu" : "rouge";
    
        // 🏆 Mise à jour des stats des joueurs
        for (const playerID of teams[winningTeam]) {
            await UpdateUserStats(playerID, true, 100, 50); // Gagnants
        }
        for (const playerID of teams[losingTeam]) {
            await UpdateUserStats(playerID, false, 50, 25); // Perdants
        }
    
        // 🕵️‍♂️ Mise à jour des stats des Maîtres Espions
        await UpdateUserStats(masterSpies[winningTeam], true, 150, 75);
        await UpdateUserStats(masterSpies[losingTeam], false, 75, 35);
    
        await EndGameTable(gameHost, gameTable, guild);
    }
    

    client.on("interactionCreate", async interaction => {
        await handleGuess(interaction);
    });

    await startGame();
    break;
} 