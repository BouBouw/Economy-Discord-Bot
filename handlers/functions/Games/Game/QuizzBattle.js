case 0: {
            let currentPlayer = 0;
            const players = gameTable.map((member) => ({
                id: member.userID,
                score: 0,
            }));
        
            const questions = [
                {
                    question: "Quelle est la capitale de la France ?",
                    options: ["Paris", "Londres", "Berlin", "Madrid"],
                    correctAnswer: "Paris"
                },
                {
                    question: "Qui a peint la Joconde ?",
                    options: ["Van Gogh", "Picasso", "Léonard de Vinci", "Monet"],
                    correctAnswer: "Léonard de Vinci"
                },
                {
                    question: "Quel est le plus grand océan du monde ?",
                    options: ["Atlantique", "Indien", "Pacifique", "Arctique"],
                    correctAnswer: "Pacifique"
                },
                {
                    question: "En quelle année a eu lieu la Révolution française ?",
                    options: ["1789", "1815", "1750", "1804"],
                    correctAnswer: "1789"
                },
                {
                    question: "Quelle est la planète la plus proche du Soleil ?",
                    options: ["Vénus", "Mars", "Mercure", "Jupiter"],
                    correctAnswer: "Mercure"
                },
                {
                    question: "Qui était le premier président des États-Unis ?",
                    options: ["Abraham Lincoln", "Thomas Jefferson", "George Washington", "John Adams"],
                    correctAnswer: "George Washington"
                },
                {
                    question: "Quel est le plus long fleuve du monde ?",
                    options: ["Amazonie", "Nil", "Mississippi", "Yangtsé"],
                    correctAnswer: "Nil"
                },
                {
                    question: "Quelle est la monnaie officielle du Japon ?",
                    options: ["Yen", "Won", "Dollar", "Euro"],
                    correctAnswer: "Yen"
                },
                {
                    question: "Quelle est la ville la plus peuplée du monde ?",
                    options: ["Tokyo", "New York", "Shanghai", "São Paulo"],
                    correctAnswer: "Tokyo"
                },
                {
                    question: "Qui a découvert l'Amérique en 1492 ?",
                    options: ["Marco Polo", "Christophe Colomb", "Vasco de Gama", "Magellan"],
                    correctAnswer: "Christophe Colomb"
                },
                {
                    question: "Quel pays a remporté la Coupe du Monde de football en 2018 ?",
                    options: ["Brésil", "Allemagne", "France", "Argentine"],
                    correctAnswer: "France"
                },
                {
                    question: "Quel est l'organe le plus grand du corps humain ?",
                    options: ["Cœur", "Foie", "Peau", "Poumons"],
                    correctAnswer: "Peau"
                },
                {
                    question: "Qui a écrit 'Les Misérables' ?",
                    options: ["Gustave Flaubert", "Victor Hugo", "Émile Zola", "Molière"],
                    correctAnswer: "Victor Hugo"
                },
                {
                    question: "Quel est le symbole chimique du fer ?",
                    options: ["Fe", "Ir", "Fr", "Fi"],
                    correctAnswer: "Fe"
                },
                {
                    question: "Dans quel pays se trouve la tour de Pise ?",
                    options: ["Espagne", "Italie", "France", "Grèce"],
                    correctAnswer: "Italie"
                },
                {
                    question: "Qui est l'auteur de la théorie de la relativité ?",
                    options: ["Isaac Newton", "Albert Einstein", "Galilée", "Stephen Hawking"],
                    correctAnswer: "Albert Einstein"
                },
                {
                    question: "Quel est le plus haut sommet du monde ?",
                    options: ["Mont Everest", "Mont Blanc", "K2", "Kilimandjaro"],
                    correctAnswer: "Mont Everest"
                },
                {
                    question: "Quelle est la capitale du Canada ?",
                    options: ["Toronto", "Vancouver", "Ottawa", "Montréal"],
                    correctAnswer: "Ottawa"
                },
                {
                    question: "Qui a composé la '9e symphonie' ?",
                    options: ["Mozart", "Beethoven", "Bach", "Chopin"],
                    correctAnswer: "Beethoven"
                },
                {
                    question: "Quelle est la langue officielle du Brésil ?",
                    options: ["Espagnol", "Portugais", "Français", "Anglais"],
                    correctAnswer: "Portugais"
                },
                {
                    question: "Quel est le plus grand désert du monde ?",
                    options: ["Sahara", "Gobi", "Arctique", "Antarctique"],
                    correctAnswer: "Antarctique"
                },
                {
                    question: "Quel est le nom du plus grand satellite naturel de la Terre ?",
                    options: ["Titan", "Lune", "Europe", "Io"],
                    correctAnswer: "Lune"
                },
                {
                    question: "Qui est le fondateur de Microsoft ?",
                    options: ["Steve Jobs", "Mark Zuckerberg", "Bill Gates", "Elon Musk"],
                    correctAnswer: "Bill Gates"
                },
                {
                    question: "Combien y a-t-il de continents sur Terre ?",
                    options: ["5", "6", "7", "8"],
                    correctAnswer: "7"
                },
                {
                    question: "Quel est le symbole chimique de l'or ?",
                    options: ["Ag", "Au", "Pb", "Pt"],
                    correctAnswer: "Au"
                },
                {
                    question: "Quel pays est connu pour le Taj Mahal ?",
                    options: ["Inde", "Pakistan", "Iran", "Turquie"],
                    correctAnswer: "Inde"
                },
                {
                    question: "Quelle est la plus grande île du monde ?",
                    options: ["Groenland", "Australie", "Madagascar", "Borneo"],
                    correctAnswer: "Groenland"
                },
                {
                    question: "Quel est l'élément chimique le plus abondant dans l'univers ?",
                    options: ["Oxygène", "Carbone", "Hydrogène", "Hélium"],
                    correctAnswer: "Hydrogène"
                },
                {
                    question: "En quelle année l'homme a-t-il marché sur la Lune pour la première fois ?",
                    options: ["1965", "1969", "1972", "1980"],
                    correctAnswer: "1969"
                }
            ];
            
        
            function getRandomQuestion() {
                return questions[Math.floor(Math.random() * questions.length)];
            }
        
            await channel.send({
                content: `${players.map(player => `<@${player.id}>`).join(', ')}\nLa partie commence dans **10 secondes** !`,
            });
        
            await new Promise(resolve => setTimeout(resolve, 10000));
        
            async function askQuestion() {
                const currentPlayerData = players[currentPlayer];
                const question = getRandomQuestion();
        
                const row = new ActionRowBuilder().addComponents(
                    question.options.map((option, index) =>
                        new ButtonBuilder()
                            .setCustomId(`answer_${index}`)
                            .setLabel(option)
                            .setStyle(ButtonStyle.Primary)
                    )
                );
        
                const questionMessage = await channel.send({
                    content: `🎲 **Question pour <@${currentPlayerData.id}>** : ${question.question}`,
                    components: [row]
                });
        
                const filter = (interaction) => interaction.user.id === currentPlayerData.id;
                const collector = questionMessage.createMessageComponentCollector({ filter, time: 30000 });
        
                let answered = false;
        
                collector.on('collect', async (interaction) => {
                    await interaction.deferUpdate();
                    answered = true;
        
                    const selectedOptionIndex = interaction.customId.split('_')[1];
                    const selectedOption = question.options[selectedOptionIndex];
        
                    if (selectedOption === question.correctAnswer) {
                        currentPlayerData.score++;
                        await channel.send(`✅ <@${currentPlayerData.id}> a répondu correctement ! Score actuel : ${currentPlayerData.score}`);
                    } else {
                        await channel.send(`❌ <@${currentPlayerData.id}> a répondu incorrectement. La bonne réponse était : ${question.correctAnswer}`);
                    }
        
                    collector.stop();
                });
        
                collector.on('end', async () => {
                    await questionMessage.delete();
        
                    if (!answered) {
                        let e = 0;

                        e++
                        await channel.send(`⏳ <@${currentPlayerData.id}> n'a pas répondu à temps ! Tour suivant...`);

                        if(e === 3) {
                            await channel.send(`Un joueur esty inactif dans la partie, annulation de celle-ci.`);
                        await EndGameTable(GameHost, gameTable, guild);
                        }
                    }
        
                    if (currentPlayerData.score >= 15) {
                        await channel.send(`🏆 <@${currentPlayerData.id}> a gagné le Quizz Battle avec un score de ${currentPlayerData.score} points !`);

                        await UpdateUserStats(currentPlayerData.id, true, 50, 100);

                        for (const player of players) {
                            if (player.id !== currentPlayerData.id) {
                                await UpdateUserStats(player.id, false, 10, 25); 
                            }
                        }

                        await EndGameTable(GameHost, gameTable, guild);
                        return;
                    }
        
                    currentPlayer = (currentPlayer + 1) % players.length;
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    askQuestion();
                });
            }
        
            askQuestion();
            break;
        }