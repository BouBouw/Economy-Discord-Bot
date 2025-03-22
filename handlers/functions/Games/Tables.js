const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder, Colors } = require('discord.js');

const { connection, client } = require('../../../index.js');
const Logs = require('../Client/Logs.js');


const gameMapping = {
    0: "Quizz Battle",
    1: "Tic-Tac-Toe",
    2: "Duel de Mots",
    3: "Course de Dés",
    4: "Codenames",
    5: "Loup-Garou",
    6: "Pierre Papier Ciseaux",
    7: "Poker",
    8: "Monopoly"
}

const modeMapping = {
    0: 2,
    1: 4,
    2: 6,
    3: 8,
    4: 10,
    5: 12
}

const Manager = async (gameHost, gameTable, guild) => {
    const users = [];

    for (const user of gameTable) {
        try {
            const member = await guild.members.fetch(user.userID);
            if (member) {
                await users.push(member);

                await member.send({
                    embeds: [{
                        color: Colors.Blue,
                        description: `La partie va commencer dans 30 secondes...`,
                        fields: [
                            {
                                name: `${gameMapping[gameHost.gameType]}`,
                                value: `**Mode de jeu :** ${modeMapping[gameHost.gameMode]} joueurs`
                            },
                            {
                                name: `Joueurs :`,
                                value: gameTable.map(entry => `<@${entry.userID}>`).join(', ') || 'Aucun adversaire pour le moment.'
                            }
                        ]
                    }]
                });

            }
        } catch (err) {
            console.error(`Erreur lors de l'envoi du message à ${user.userID} :`, err);
        }
    }

    setTimeout(async () => {
        await StartGameTable(gameHost, gameTable, guild)
    }, 20000)
}

const CreateGameTable = (uuid, userID, gameType, gameMode, channel, message) => {
    channel.threads.create({
        name: `jeu-${uuid}`,
        autoArchiveDuration: 60,
        reason: `Game ID : ${uuid}`
    }).then(async (thread) => {
        if (thread.joinable) await thread.join();

        connection.query(`INSERT INTO games_hosted (uuid, hostID, gameType, gameMode) VALUES (?, ?, ?, ?)`,
            [uuid, userID, gameType, gameMode],
            function(err) {
                if(err) throw err;
                connection.query(
                    `CREATE TABLE games_${(uuid).toLowerCase()} (
                        id INT AUTO_INCREMENT PRIMARY KEY, 
                        userID VARCHAR(255), 
                        joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )`, 
                    function (err) {
                        if(err) throw err;

                        connection.query(
                            `INSERT INTO games_${(uuid).toLowerCase()} (userID) VALUES (?)`, 
                            [userID], 
                            function (err) {
                                if (err) return console.error("Erreur lors de l'insertion du joueur :", err);
        
                                message.edit({
                                    embeds: [{
                                        color: Colors.Blue,
                                        description: `Votre partie de **${gameMapping[gameType]}** (${modeMapping[gameMode]} joueurs) vient d'être créée.`,
                                        footer: { text: `Veuillez patienter en attendant des joueurs...` }
                                    }],
                                    components: []
                                });

                                thread.send({
                                    embeds: [{
                                        color: Colors.Blue,
                                        description: `Une partie de **${gameMapping[gameType]}** vient d'être créer par <@${userID}>.`,
                                        fields: [
                                            {
                                                name: `Options :`,
                                                value: `Mode de jeu : \`${modeMapping[gameMode]} joueurs\``
                                            }
                                        ],
                                        footer: {
                                            text: `Game ID : ${uuid}`
                                        }
                                    }],
                                    components: [
                                        new ActionRowBuilder()
                                        .addComponents(
                                            new ButtonBuilder()
                                            .setCustomId('game.join_game')
                                            .setLabel("Rejoindre la partie")
                                            .setStyle(ButtonStyle.Success),
                                            new ButtonBuilder()
                                            .setCustomId('game.cancel')
                                            .setLabel("Annuler la partie")
                                            .setStyle(ButtonStyle.Danger)
                                        )
                                    ]
                                })

                                thread.members.add(userID);
                                thread.send({
                                    content: `[1/${modeMapping[gameMode]}] <@${userID}> vient de rejoindre la partie de **${gameMapping[gameType]}**.`
                                })

                                Logs.OnlineLogs('type.online.create', gameType, gameMode, userID)
                            }
                        );
                    })
            }
        )
    })
}

const JoinGameTable = async (interaction) => {
    let page = 0;
    let filters = new Set();
    const pageSize = 5;

    async function fetchGames() {
        return new Promise((resolve, reject) => {
            let query = "SELECT * FROM games_hosted ORDER BY createdAt DESC";
            if (filters.size > 0) {
                const filterValues = Array.from(filters).map(f => `'${f}'`).join(", ");
                query = `SELECT * FROM games_hosted WHERE gameType IN (${filterValues}) ORDER BY createdAt DESC`;
            }
            connection.query(query, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }

    async function updateMessage(msg) {
        const games = await fetchGames();
        const totalPages = Math.ceil(games.length / pageSize);
        page = Math.max(0, Math.min(page, totalPages - 1));
        
        const start = page * pageSize;
        const pageData = games.slice(start, start + pageSize);

        const embed = new EmbedBuilder()
            .setColor(Colors.Blue)
            .setFooter({ text: `Page: ${page + 1}/${totalPages}` });

        if (pageData.length === 0) {
            embed.setDescription('Aucune partie en ligne active.');
        } else {
            embed.setDescription(
                pageData.map((entry, index) => 
                    `\`#${start + index + 1}\` <@${entry.hostID}>
                    Crée le: <t:${Math.floor(entry.createdAt / 1000)}:f>
                    **Jeu:** ${gameMapping[entry.gameType]}
                    **Mode:** ${modeMapping[entry.gameMode]} joueurs`
                ).join('\n\n')
            );
        }

        await msg.edit({ embeds: [embed], components: generateComponents(totalPages, pageData) });
    }

    function generateComponents(totalPages, pageData) {
        const filterButtons = Object.keys(gameMapping).map(gameType =>
            new ButtonBuilder()
                .setCustomId(`filter.${gameType}`)
                .setLabel(gameMapping[gameType])
                .setStyle(filters.has(gameType) ? ButtonStyle.Success : ButtonStyle.Secondary)
        );

        const filterRows = [];
        for (let i = 0; i < filterButtons.length; i += 5) {
            filterRows.push(new ActionRowBuilder().addComponents(filterButtons.slice(i, i + 5)));
        }

        return [
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('game.first_page')
                        .setLabel('⏮️ Première page')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === 0),
                    new ButtonBuilder()
                        .setCustomId('game.prev_page')
                        .setLabel('⬅️ Page précédente')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === 0),
                    new ButtonBuilder()
                        .setCustomId('game.next_page')
                        .setLabel('➡️ Page suivante')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page >= totalPages - 1),
                    new ButtonBuilder()
                        .setCustomId('game.last_page')
                        .setLabel('⏭️ Dernière page')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page >= totalPages - 1)
                ),
            ...filterRows,
            new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('game.select')
                        .setPlaceholder('Choisissez une partie à rejoindre')
                        .addOptions(
                            pageData.length > 0 ?
                            pageData.slice(0, Math.min(pageData.length, 25)).map(entry =>
                                new StringSelectMenuOptionBuilder()
                                    .setLabel(`[1/${modeMapping[entry.gameMode]}] ${gameMapping[entry.gameType]} - ${modeMapping[entry.gameMode]} joueurs`.substring(0, 100))
                                    .setValue(entry.uuid)
                            ) :
                            [new StringSelectMenuOptionBuilder()
                                .setLabel('Aucune partie disponible')
                                .setValue('no_data')]
                        )
                )
        ];
    }

    const msg = await interaction.reply({
        embeds: [{ description: 'Chargement des parties en cours...' }],
        components: generateComponents(1, []),
        fetchReply: true
    });

    await updateMessage(msg)
    

    const collector = msg.createMessageComponentCollector({ time: 60000 });

    collector.on('collect', async i => {
        if (i.user.id !== interaction.user.id) return;

        if (i.customId.startsWith('game.')) {
            if (i.customId === 'game.first_page') page = 0;
            if (i.customId === 'game.prev_page') page = Math.max(0, page - 1);
            if (i.customId === 'game.next_page') page++;
            if (i.customId === 'game.last_page') page = Infinity;
        }
        
        if (i.customId.startsWith('filter.')) {
            await i.deferUpdate();

            const filter = i.customId.split('.')[1];
            if (filters.has(filter)) filters.delete(filter);
            else filters.add(filter);
            page = 0;
        }

        if (i.customId === 'game.select') {
            const selectedGame = i.values[0];
            if (selectedGame === 'no_data') {
                await interaction.followUp({ content: 'Aucune partie disponible.', ephemeral: true });
            } else {
                VerifyGameTable(selectedGame, i)
            }
        }
        
        await updateMessage(msg);
    });
};


const LeaveGameTable = () => {
    // check if game is already started & member is on game

    // remove member from table
}

const StartGameTable = async (gameHost, gameTable, guild) => {
    const channel = await getChannelThread(gameHost.uuid, guild);

    Logs.OnlineLogs('type.online.start', gameHost, gameTable, null)

    console.log(gameHost)
    switch(gameHost.gameType) {
        // Quizz Battle
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

        // Tic-Tac-Toe
        case 1: {
            const mode = gameHost.gameMode;

            const gridSize = mode === 0 ? 3 : 8;
            const symbolsToWin = mode === 0 ? 3 : 4;
            const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));

            const players = mode === 0
            ? gameTable.map((member, index) => ({
                id: member.userID,
                symbol: index === 0 ? '❌' : '⭕',
            }))
            : gameTable.map((member, index) => ({
                id: member.userID,
                symbol: index % 2 === 0 ? '❌' : '⭕',
            }));
    
            let currentPlayer = 0;

            function generateGrid() {
                const rows = grid.map((row, rowIndex) => {
                    const actionRow = new ActionRowBuilder();
                    row.forEach((cell, colIndex) => {
                        actionRow.addComponents(
                            new ButtonBuilder()
                                .setCustomId(`cell_${rowIndex}_${colIndex}`)
                                .setLabel(cell || '\u200b')
                                .setStyle(cell ? ButtonStyle.Secondary : ButtonStyle.Primary)
                                .setDisabled(Boolean(cell))
                        );
                    });
                    return actionRow;
                });
                return rows;
            }

            function checkWin(symbol) {
                const directions = [
                    [0, 1], [1, 0], [1, 1], [1, -1],
                ];
        
                for (let row = 0; row < gridSize; row++) {
                    for (let col = 0; col < gridSize; col++) {
                        if (grid[row][col] !== symbol) continue;
        
                        for (const [dx, dy] of directions) {
                            let count = 0;
                            for (let step = 0; step < symbolsToWin; step++) {
                                const x = row + dx * step;
                                const y = col + dy * step;
                                if (x < 0 || x >= gridSize || y < 0 || y >= gridSize || grid[x][y] !== symbol) break;
                                count++;
                            }
                            if (count === symbolsToWin) return true;
                        }
                    }
                }
                return false;
            }

            function isGridFull() {
                return grid.every(row => row.every(cell => cell !== null));
            }

            async function updateGridMessage(message) {
                await message.edit({
                    content: `C'est au tour de <@${players[currentPlayer].id}> (${players[currentPlayer].symbol})`,
                    components: generateGrid(),
                });
            }

            await channel.send({
                content: `${players.map(player => `<@${player.id}>`).join(', ')}\nLa partie commence dans **10 secondes** !`,
            }).then((msg) => {
                setTimeout(async () => {
                    await msg.delete();
                    channel.send({
                        content: `C'est au tour de <@${players[currentPlayer].id}> (${players[currentPlayer].symbol})`,
                        components: generateGrid(),
                    }).then((message) => {
                        const collector = channel.createMessageComponentCollector({
                            filter: interaction => players.some(player => player.id === interaction.user.id),
                            time: 10 * 60 * 1000,
                        });
        
                        collector.on('collect', async (interaction) => {
                            const [_, row, col] = interaction.customId.split('_').map(Number);
        
                            if (interaction.user.id !== players[currentPlayer].id) {
                                await interaction.reply({
                                    content: "Ce n'est pas votre tour !",
                                    ephemeral: true,
                                });
                                return;
                            }
        
                            grid[row][col] = players[currentPlayer].symbol;
        
                            if (checkWin(players[currentPlayer].symbol)) {
                                collector.stop();

                                channel.send({
                                    embeds: [{
                                        color: Colors.Green,
                                        description: `🎉 Félicitations, <@${players[currentPlayer].id}> (${players[currentPlayer].symbol}) a gagné la partie !`,
                                    }],
                                });

                                await UpdateUserStats(players[currentPlayer].id, true, 30, 50);

                                for (const player of players) {
                                    if (player.id !== players[currentPlayer].id) {
                                        await UpdateUserStats(player.id, false, 10, 20);
                                    }
                                }

                                await EndGameTable(gameHost, gameTable, guild);
                                return;
                            }
        
                            if (isGridFull()) {
                                collector.stop();

                                channel.send({
                                    embeds: [{
                                        color: Colors.Orange,
                                        description: "🤝 La partie se termine sur une égalité !",
                                    }],
                                });

                                for (const player of players) {
                                    await UpdateUserStats(player.id, null, 15, 30); // Pas de gagnant ni perdant
                                }

                                await EndGameTable(gameHost, gameTable, guild);
                                return;
                            }
        
                            currentPlayer = (currentPlayer + 1) % players.length;
        
                            await interaction.deferUpdate();
                            updateGridMessage(message);
                        });
        
                        collector.on('end', (_, reason) => {
                            if (reason === 'time') {
                                channel.send({
                                    embeds: [{
                                        color: Colors.Red,
                                        description: "⏳ Temps écoulé ! La partie a été annulée.",
                                    }],
                                });
                            }
                        });
                    });
                }, 10000);
            });

            break;
        }

        // Words Battle
        case 2: {
            let currentPlayer = 0;
            const usedWords = new Set();
            let lastWord = "";
        
            let players = gameTable.map((member) => ({
                id: member.userID,
                score: 0,
                error: 0,
                eliminated: false
            }));
        
            function isValidWord(word) {
                return (
                    (!lastWord || word[0].toLowerCase() === lastWord.slice(-1).toLowerCase()) &&
                    !usedWords.has(word.toLowerCase()) &&
                    /^[a-zA-Z]+$/.test(word)
                );
            }
        
            function switchPlayer() {
                do {
                    currentPlayer = (currentPlayer + 1) % players.length;
                } while (players[currentPlayer].eliminated);
        
                channel.send(`C'est au tour de <@${players[currentPlayer].id}> ! **(${lastWord ? lastWord.slice(-1).toUpperCase() : 'une lettre'})**`);
            }
        
            async function endGame(winnerIndex) {
                const winner = players[winnerIndex];
        
                await UpdateUserStats(winner.id, true, winner.score * 5 + 50, winner.score * 2 + 100);
        
                for (const player of players) {
                    if (player.id !== winner.id) {
                        await UpdateUserStats(player.id, false, player.score * 5 + 20, player.score * 2 + 50);
                    }
                }
        
                await EndGameTable(gameHost, gameTable, guild);
        
                return channel.send({
                    embeds: [{
                        color: Colors.Green,
                        description: `🎉 Félicitations, <@${winner.id}> remporte la partie avec un score de **${winner.score}** !`,
                    }],
                });
            }
        
            await channel.send({
                content: `${players.map(player => `<@${player.id}>`).join(', ')}\nLa partie commence dans **10 secondes** !`,
            }).then(async () => {
                await new Promise(resolve => setTimeout(resolve, 10000));
        
                channel.send(`C'est au tour de <@${players[currentPlayer].id}> de commencer.**`);
                const collector = channel.createMessageCollector({
                    filter: (msg) => players.some(player => player.id === msg.author.id),
                    time: 10 * 60 * 1000,
                });
        
                collector.on('collect', (message) => {
                    const player = players.find(p => p.id === message.author.id);
                    if (!player || player.eliminated) {
                        message.reply("Vous êtes éliminé ou ce n'est pas votre tour !");
                        return;
                    }
        
                    if (message.author.id !== players[currentPlayer].id) {
                        message.reply("Ce n'est pas votre tour !");
                        return;
                    }
            
                    const word = message.content.trim().toLowerCase();
            
                    if (!isValidWord(word)) {
                        player.error += 1;
        
                        if (player.error >= 3) {
                            player.eliminated = true;
                            message.reply(`❌ <@${player.id}> a été éliminé après **3 erreurs** !`);
                            
                            if (players.filter(p => !p.eliminated).length === 1) {
                                collector.stop(players.findIndex(p => !p.eliminated));
                            } else {
                                switchPlayer();
                            }
                            return;
                        }
        
                        message.reply(`Mot invalide ! Le mot doit commencer par **${lastWord ? lastWord.slice(-1).toUpperCase() : 'une lettre'}**, être unique et contenir uniquement des lettres.`);
                        return;
                    }
            
                    usedWords.add(word);
                    lastWord = word;
                    player.score += 1;
                    message.reply(`✅ Mot accepté ! Score actuel : **${player.score}**`);
                    switchPlayer();
                });
        
                collector.on('end', async (_, reason) => {
                    if (reason === 'time') {
                        channel.send({
                            embeds: [{
                                color: Colors.Orange,
                                description: "⏳ Temps écoulé ! La partie se termine sans vainqueur.",
                            }],
                        });
        
                        for (const player of players) {
                            await UpdateUserStats(player.id, null, player.score * 5 + 15, player.score * 2 + 30);
                        }
        
                        await EndGameTable(gameHost, gameTable, guild);
                        return;
                    } else {
                        endGame(reason);
                    }
                });
            });
        
            break;
        }        
        
        // Dices Race
        case 3: {
            const players = gameTable.map((member) => ({
                id: member.userID,
                position: 0,
            }));

            const finishLine = 20;

            await channel.send({
                content: `${players.map(player => `<@${player.id}>`).join(', ')}\nLa partie commence dans **10 secondes** !`,
            }).then(async () => {
                await new Promise(resolve => setTimeout(resolve, 10000));

                function rollDice() {
                    return Math.floor(Math.random() * 6) + 1;
                }

                function updatePositions() {
                    players.forEach((player) => {
                        const diceRoll = rollDice();
                        player.position += diceRoll;
                        channel.send(`<@${player.id}> a fait un **${diceRoll}** et est maintenant à la case **${player.position}**.`);
                    });
                }

                function checkWinner() {
                    const winner = players.find((player) => player.position >= finishLine);
                    if (winner) {
                        EndGameTable(gameHost, gameTable, guild);

                        channel.send({
                            embeds: [{
                                color: Colors.Green,
                                description: `🎉 Félicitations, <@${winner.id}> a gagné la course !`,
                            }],
                        });
                        return true;
                    }
                    return false;
                }

                const interval = setInterval(() => {
                    updatePositions();
                    if (checkWinner()) {
                        clearInterval(interval);
                    }
                }, 5000);
            })

            break;
        }

        // Codenames
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

        // Werewolf
        case 5: {        
            const ROLES = {
                LOUP_GAROU: "Loup-Garou",
                VILLAGEOIS: "Villageois",
                VOYANTE: "Voyante",
                CHASSEUR: "Chasseur",
                CUPIDON: "Cupidon",
                LOUP_BLANC: "Loup-Garou Blanc",
                SORCIERE: "Sorcière",
                PETITE_FILLE: "Petite Fille"
            };
        
            let game = {
                isRunning: true,
                channel: channel,
                members: gameTable,
                roles: {},
                phase: "NIGHT",
                votes: {},
                aliveMembers: [...gameTable],
                deadMembers: [],
                lovers: [],
                witchPotionUsed: { heal: false, kill: false }
            };
        
            function shuffleArray(array) {
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
                return array;
            }
        
            function distributeRoles() {
                const roleList = [
                    ROLES.LOUP_GAROU, ROLES.LOUP_GAROU,
                    ROLES.VILLAGEOIS, ROLES.VILLAGEOIS, ROLES.VOYANTE,
                    ROLES.CHASSEUR, ROLES.CUPIDON, ROLES.SORCIERE,
                    ROLES.LOUP_BLANC, ROLES.PETITE_FILLE
                ];
        
                let shuffledRoles = shuffleArray(roleList);
                let assignedRoles = {};
        
                game.aliveMembers.forEach((member, index) => {
                    assignedRoles[member.userID] = shuffledRoles[index % shuffledRoles.length];
                });
        
                return assignedRoles;
            }
        
            async function startGame() {
                game.roles = distributeRoles();
                await channel.send("🦉 **Le jeu du Loup-Garou commence !** 🦉");
        
                for (const player of game.aliveMembers) {
                    const role = game.roles[player.userID];
                    try {
                        await player.send(`🎭 **Ton rôle est :** ${role}`);
                    } catch (error) {
                        console.error(`Impossible d'envoyer un message à ${player.userID}`);
                    }
                }
        
                await phaseCupidon();
            }
        
            async function phaseCupidon() {
                let cupidon = game.aliveMembers.find(member => game.roles[member.userID] === ROLES.CUPIDON);
                if (!cupidon) return startNight();
        
                await channel.send("💘 **Cupidon, sélectionne deux joueurs à lier en amour !**");
                setTimeout(() => startNight(), 10000);
            }
        
            async function startNight() {
                game.phase = "NIGHT";
                await channel.send("🌙 **La nuit tombe... Les Loups-Garous se réveillent !**");
            
                if (Math.random() < 0.3) {
                    await triggerRandomEvent();
                }
            
                setTimeout(() => resolveNight(), 60000);
            }
        
            async function resolveNight() {
                let victim = getMostVotedPlayer();
                if (victim) {
                    game.aliveMembers = game.aliveMembers.filter(member => member.userID !== victim.userID);
                    game.deadMembers.push(victim);
        
                    await channel.send(`☠️ **${victim.username} (${game.roles[victim.userID]}) a été tué(e) par les Loups-Garous !**`);
                } else {
                    await channel.send("😴 Aucun villageois n'a été attaqué cette nuit.");
                }
        
                await phaseSorciere(victim);
            }
        
            async function phaseSorciere(victim) {
                let sorciere = game.aliveMembers.find(member => game.roles[member.userID] === ROLES.SORCIERE);
                if (!sorciere) return startDay();
        
                await channel.send("🔮 **Sorcière, veux-tu utiliser tes potions ?**");
                setTimeout(() => startDay(), 10000);
            }
        
            async function startDay() {
                game.phase = "DAY";
                await channel.send("☀️ **Le jour se lève, les villageois débattent !**");
            
                if (Math.random() < 0.3) {
                    await triggerRandomEvent();
                }
            
                setTimeout(() => resolveDay(), 60000);
            }
            
        
            async function resolveDay() {
                let victim = getMostVotedPlayer();
                if (victim) {
                    game.aliveMembers = game.aliveMembers.filter(member => member.userID !== victim.userID);
                    game.deadMembers.push(victim);
        
                    await channel.send(`⚰️ **${victim.username} (${game.roles[victim.userID]}) a été éliminé(e) par le village !**`);
                } else {
                    await channel.send("🤷 Aucun vote décisif, personne n'est éliminé aujourd'hui.");
                }
        
                checkGameOver();
            }
        
            function getMostVotedPlayer() {
                let voteCounts = {};
                Object.values(game.votes).forEach(vote => {
                    voteCounts[vote] = (voteCounts[vote] || 0) + 1;
                });
        
                let maxVotes = Math.max(...Object.values(voteCounts));
                let mostVoted = Object.keys(voteCounts).find(key => voteCounts[key] === maxVotes);
                return game.aliveMembers.find(member => member.userID === mostVoted);
            }
        
            function checkGameOver() {
                let wolves = game.aliveMembers.filter(member => game.roles[member.userID].includes("Loup"));
                let villagers = game.aliveMembers.filter(member => !game.roles[member.userID].includes("Loup"));
        
                if (wolves.length === 0) {
                    channel.send("🎉 **Les Villageois ont gagné !** 🎉");
                    game.isRunning = false;
                    endGame("Villageois");
                } else if (wolves.length >= villagers.length) {
                    channel.send("🐺 **Les Loups-Garous ont gagné !** 🐺");
                    game.isRunning = false;
                    endGame("Loups-Garous");
                } else {
                    startNight();
                }
            }
        
            async function triggerRandomEvent() {
                const events = [
                    "🌪 **Une tempête de neige empêche les votes aujourd'hui !**",
                    "👻 **Un fantôme revient hanter le village, il donne un indice !**",
                    "🔮 **Un voyant annonce une vision : ‘Un Loup-Garou se cache dans les 3 premiers joueurs !’**",
                ];
        
                let randomEvent = events[Math.floor(Math.random() * events.length)];
                await channel.send(randomEvent);
            }

            async function endGame(winningTeam) {
                await channel.send("🎭 **Fin de la partie du Loup-Garou ! Merci d'avoir joué !**");
            
                // 🏆 Mise à jour des stats des joueurs
                for (const player of game.members) {
                    let isWinner = (winningTeam === "Villageois" && !game.roles[player.userID].includes("Loup")) ||
                                   (winningTeam === "Loups-Garous" && game.roles[player.userID].includes("Loup"));
            
                    let xp = isWinner ? 150 : 75;
                    let coins = isWinner ? 50 : 25;
            
                    await UpdateUserStats(player.userID, isWinner, xp, coins);
                }
            
                await EndGameTable(gameHost, gameTable, guild);
            }
        
            await channel.send({
                content: `${players.map(player => `<@${player.id}>`).join(', ')}\nLa partie commence dans **10 secondes** !`,
            })

            setTimeout(() => startGame(), 10000);

            break;
        }

        // Rock Paper Scissors
        case 6: {
            let match = { round: 0 };
            const players = gameTable.map(member => ({
                id: member.userID,
                score: 0,
                choice: '',
                message: null  // Stockage du message envoyé pour le supprimer plus tard
            }));
        
            await channel.send({
                content: `${players.map(player => `<@${player.id}>`).join(', ')}\nLa partie commence dans **10 secondes** !`
            });
        
            await new Promise(resolve => setTimeout(resolve, 10000));
            startNextRound();
        
            function startNextRound() {
                if (players.some(player => player.score >= 3)) {
                    declareWinner();
                    return;
                }
                
                match.round += 1;
                players.forEach(player => player.choice = '');
        
                // Supprimer les messages précédents pour éviter l'accumulation de spam
                players.forEach(async player => {
                    if (player.message) await player.message.delete().catch(() => {});
                    sendChoiceMessage(player);
                });
            }
        
            async function sendChoiceMessage(entry) {
                const msg = await channel.send({
                    content: `<@${entry.id}> Faites votre choix.`,
                    components: [
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder().setCustomId('game.rock').setEmoji('🪨').setLabel('Pierre').setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder().setCustomId('game.paper').setEmoji('📃').setLabel('Feuille').setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder().setCustomId('game.scissors').setEmoji('✂️').setLabel('Ciseaux').setStyle(ButtonStyle.Secondary)
                        )
                    ]
                });
        
                entry.message = msg; // Stocker le message pour le supprimer plus tard
                handlePlayerChoice(msg, entry);
            }
        
            async function handlePlayerChoice(message, entry) {
                const filter = (i) => i.user.id === entry.id && i.isButton();
                try {
                    const interaction = await message.awaitMessageComponent({ filter, time: 15000 });
                    await interaction.deferUpdate();
                    entry.choice = interaction.customId.replace('game.', '');
                    await message.delete();
                } catch {
                    await message.delete();
                    entry.choice = ['rock', 'paper', 'scissors'][Math.floor(Math.random() * 3)];
                }
                
                if (players.every(p => p.choice !== '')) {
                    compareResults();
                }
            }
        
            function compareResults() {
                const choices = players.map(p => p.choice);
                const results = {
                    rock: 'scissors',
                    paper: 'rock',
                    scissors: 'paper'
                };
        
                if (choices[0] === choices[1]) {
                    channel.send(`Égalité ! Les deux joueurs ont choisi **${choices[0]}**`);
                } else {
                    const winner = results[choices[0]] === choices[1] ? players[0] : players[1];
                    winner.score += 1;
                    channel.send(`<@${winner.id}> remporte ce round ! **(${winner.score} points)**`);
                }
                
                setTimeout(startNextRound, 5000); // Augmentation du délai pour éviter un spam excessif
            }
        
            async function declareWinner() {
                const winner = players.find(player => player.score >= 3);
                const loser = players.find(player => player.id !== winner.id);
        
                await channel.send(`🎉 Félicitations <@${winner.id}>, tu as gagné la partie avec **${winner.score}** points !`);
        
                let xpWin = 100, coinsWin = 40;
                let xpLose = 50, coinsLose = 20;
        
                UpdateUserStats(winner.id, true, xpWin, coinsWin);
                UpdateUserStats(loser.id, false, xpLose, coinsLose);
        
                await EndGameTable(gameHost, gameTable, guild);
                return;
            }
        
            break;
        }
               

        // Poker
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
    }
}

const VerifyGameTable = async (uuid, interaction) => {
    function getGameStats() {
        return new Promise((resolve, reject) => {
            connection.query(`SELECT * FROM games_hosted WHERE uuid = '${uuid}'`, function(err, result) {
                if(err) reject(err);

                return resolve(result[0]);
            })
        })
    }

    function getGame() {
        return new Promise((resolve, reject) => {
            connection.query(`SELECT * FROM games_${(uuid).toLowerCase()}`, function(err, result) {
                if(err) reject(err);

                return resolve(result);
            })
        })
    }

    const game_host = await getGameStats();
    const game_table = await getGame();

    if (interaction.user.id === game_host.hostID) {
        return interaction.reply({
            content: `Vous ne pouvez pas rejoindre la partie car vous êtes l'organisateur.`,
            ephemeral: true
        });
    }
    
    const isUserAlreadyInGame = game_table.some(entry => entry.userID === interaction.user.id);
    if (isUserAlreadyInGame) {
        return interaction.reply({
            content: `Vous ne pouvez pas rejoindre la partie car vous êtes déjà dans la partie.`,
            ephemeral: true
        });
    }
    
    if (game_table.length >= modeMapping[game_host.gameMode]) {
        return interaction.reply({
            content: `Vous ne pouvez pas rejoindre la partie car elle est déjà pleine.`,
            ephemeral: true
        });
    }

    connection.query(`INSERT INTO games_${(uuid).toLowerCase()} (userID) VALUES ('${interaction.user.id}')`, function(err, result) {
        if(err) throw err;

        return interaction.reply({
            embeds: [{
                color: Colors.Blue,
                description: `Vous venez de rejoindre une partie de **${gameMapping[game_host.gameType]}**.`,
                fields: [
                    {
                        name: `Options :`,
                        value: `Mode de jeu : ${modeMapping[game_host.gameMode]} joueurs`
                    }
                ]
            }]
        }).then(async () => {
            const channel = await getChannelThread(game_host.uuid, interaction.guild);

            const newGameHost = await getGameStats();
            const newGameTable = await getGame();

            await channel.members.add(interaction.user.id);
            await channel.send({
                content: `[${newGameTable.length}/${modeMapping[newGameHost.gameMode]}] ${interaction.user} vient de rejoindre la partie de **${gameMapping[newGameHost.gameType]}**.`
            })

            Logs.OnlineLogs('type.online.join', newGameHost, newGameTable, interaction.user)

            if(newGameTable.length === modeMapping[newGameHost.gameMode]) {
                const message = await channel.messages.fetch({ limit: 100 });
                const messageUpdate = message.filter((m) => m.author.id === client.user.id && m.embeds.length > 0);

                const m = messageUpdate.first();
                m.edit({
                    embeds: [{
                        color: Colors.Blue,
                        description: `Une partie de **${gameMapping[newGameHost.gameType]}** vient d'être créer par <@${newGameHost.hostID}>.`,
                        fields: [
                            {
                                name: `Options :`,
                                value: `Mode de jeu : \`${modeMapping[newGameHost.gameMode]} joueurs\``
                            },
                            {
                                name: `Joueurs :`,
                                value: newGameTable.map(player => `<@${player.userID}>`).join(', ') || "Joueurs introuvables."
                            }
                        ],
                        footer: {
                            text: `Game ID : ${newGameHost.uuid}`
                        }
                    }],
                    components: [
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setCustomId('game.join_game')
                            .setLabel("Rejoindre la partie")
                            .setStyle(ButtonStyle.Success)
                            .setDisabled(true),
                            new ButtonBuilder()
                            .setCustomId('game.cancel')
                            .setLabel("Annuler la partie")
                            .setStyle(ButtonStyle.Danger)
                            .setDisabled(true),
                        )
                    ]  
                })

                return Manager(newGameHost, newGameTable, interaction.guild);
            }
        })
    })
}

const EndGameTable = async (GameHost, GameTable, guild) => {
    await new Promise(resolve => setTimeout(resolve, 10000));

    const channel = await getChannelThread(GameHost.uuid, guild);

    await channel.delete();
    connection.query(`DELETE FROM games_hosted WHERE uuid = '${GameHost.uuid}'`, function(err, result) {
        connection.query(`DROP TABLE games_${(GameHost.uuid).toLowerCase()}`, function(err, result) {
            Logs.OnlineLogs('type.online.end', GameHost, GameTable, null);
        })
    })
}

async function getChannelThread(uuid, guild) {
    try {
        for(const channel of guild.channels.cache.values()) {
            if(channel.isTextBased() && channel.threads) {
                const activeThreads = await channel.threads.fetchActive();
                const archivedThreads = await channel.threads.fetchArchived();

                const allThreads = [...activeThreads.threads.values(), ...archivedThreads.threads.values()];

                const thread = allThreads.find((t) => t.name === `jeu-${uuid}`);

                if(thread) {
                    return thread;
                }
            }
        }
    } catch(err) {

    }
}

async function TablesManager() {
    client.on('interactionCreate', async (interaction) => {
        if(!interaction.isButton()) return;

        switch(interaction.customId) {
            case 'game.join_game': {
                const uuid = (interaction.channel.name).split('-')[1];
                
                VerifyGameTable(uuid, interaction)
                break;
            }

            case 'game.cancel': {
                const uuid = (interaction.channel.name).split('-')[1];

                connection.query(`SELECT * FROM games_hosted WHERE uuid = '${uuid}'`, function(err, result) {
                    const gameHost = result[0];

                    if(interaction.user.id !== gameHost.hostID) return interaction.reply({
                        content: `Vous n'êtes pas l'organisateur de la partie.`,
                        ephemeral: true
                    })

                    EndGameTable(gameHost, [], interaction.guild);
                })
                break;
            }
        }
    })
}

async function UpdateUserStats(userID, isWin, expGain = 10, coinReward = 50) {
    return new Promise((resolve, reject) => {
        const winUpdate = isWin ? 'gameWin = gameWin + 1,' : 'gameLoose = gameLoose + 1,';
        const query = `
            UPDATE profile 
            SET 
                gameTotal = gameTotal + 1,
                ${winUpdate}
                experiences = experiences + ?,
                coins = coins + ?
            WHERE userID = ?;
        `;

        connection.query(query, [expGain, coinReward, userID], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}

const Tables = {
    CreateGameTable,
    JoinGameTable,
    TablesManager
}

module.exports = Tables;