const { Colors } = require('discord.js');
const { client } = require("../..");

const config = require('../../config.json');

const VoicesLogs = (type, user, c, int) => {
    const channel = client.channels.cache.get(config.guild.logsID.voices);
    switch(type) {
        case 'type.voice.join': {
            channel.send({
                embeds: [{
                    color: Colors.Green,
                    description: `${user} vient de rejoindre le salon ${c}.`,
                    timestamp: new Date().toISOString(),
                }]
            })
            break;
        }

        case 'type.voice.leave': {
            channel.send({
                embeds: [{
                    color: Colors.Red,
                    description: `${user} vient de quitter le salon ${c}.`,
                    timestamp: new Date().toISOString(),
                }]
            })
            break;
        }

        case 'type.voice.coins_add': {
            channel.send({
                embeds: [{
                    color: Colors.Blue,
                    description: `${user} vient de gagner **${int}** coins grâce a l'activité vocale.`,
                    timestamp: new Date().toISOString(),
                }]
            })
            break;
        }
    }
}

const CoinsLogs = (type, user, mod, int, crypto, reason) => {
    const channel = client.channels.cache.get(config.guild.logsID.coins);
    switch(type) {
        case 'type.coins.add': {
            channel.send({
                embeds: [{
                    color: Colors.Green,
                    description: `${mod} vient d'ajouter **${int}** coins à ${user}.`,
                    timestamp: new Date().toISOString(),
                }]
            })
            break;
        }

        case 'type.coins.remove': {
            channel.send({
                embeds: [{
                    color: Colors.Red,
                    description: `${mod} vient de retirer **${int}** coins à ${user}.`,
                    timestamp: new Date().toISOString(),
                }]
            })
            break;
        }

        case 'type.coins.transfert': {
            channel.send({
                embeds: [{
                    color: Colors.Blue,
                    description: `${user} vient de transferer **${int}** coins à ${mod}.`,
                    timestamp: new Date().toISOString(),
                }]
            })
            break
        }

        case 'type.coins.buy': {
            channel.send({
                embeds: [{
                    color: Colors.Blue,
                    description: `${user} vient d'acheter **${int}** de crypto-monnaie (\`${crypto}\`).`,
                    timestamp: new Date().toISOString(),
                }]
            })
           break; 
        }

        case 'type.coins.sell': {
            channel.send({
                embeds: [{
                    color: Colors.Blue,
                    description: `${user} vient de vendre \`${crypto}\` en crypto-monnaie (**${int}**).`,
                    timestamp: new Date().toISOString(),
                }]
            })
            break; 
        }

        case 'type.coins.rewards': {
            channel.send({
                embeds: [{
                    color: Colors.Green,
                    description: `${user} vient de recevoir **${int}** coins automatiquement (${reason}).`,
                    timestamp: new Date().toISOString(),
                }]
            })
            break;
        }
    }
}

const GamesLogs = (type, user, game) => {
    const channel = client.channels.cache.get(config.guild.logsID.games);
    switch(type) {
        case 'type.games.win': {
            channel.send({
                embeds: [{
                    color: Colors.Green,
                    description: `${user} vient de gagner une partie de \`${game.title}\` et à gagner **${game.coins}** coins.`,
                    timestamp: new Date().toISOString(),
                }]
            })
            break;
        }

        case 'type.games.loose': {
            channel.send({
                embeds: [{
                    color: Colors.Green,
                    description: `${user} vient de perdre une partie de \`${game.title}\` et à perdu **${game.coins}** coins.`,
                    timestamp: new Date().toISOString(),
                }]
            })
            break;
        }

        case 'type.games.egal': {
            channel.send({
                embeds: [{
                    color: Colors.Green,
                    description: `${user} vient de faire égalité dans une partie de \`${game.title}\`.`,
                    timestamp: new Date().toISOString(),
                }]
            })
            break;
        }
    }
}

const OnlineLogs = (type, gameHost, gameTable, target) => {
    const channel = client.channels.cache.get(config.guild.logsID.games);

    const gameMapping = {
        0: "Quizz Battle",
        1: "Tic-Tac-Toe",
        2: "Duel de Mots",
        3: "Course de Dés",
        4: "Codenames",
        5: "Loup-Garou",
        6: "Pierre Papier Ciseaux",
        7: "Poker"
    }
    
    const modeMapping = {
        0: 2,
        1: 4,
        2: 6,
        3: 8,
        4: 10,
        5: 12
    }

    switch(type) {
        case 'type.online.create': {
            channel.send({
                embeds: [{
                    color: Colors.Gold,
                    description: `<@${target}> vient de créer une partie de **${gameMapping[gameHost]}**`,
                    fields: [
                        {
                            name: `Options du jeu :`,
                            value: `**Mode :** ${modeMapping[gameTable]} joueurs`
                        }
                    ],
                    timestamp: new Date().toISOString(),
                }]
            })
            break;
        }

        case 'type.online.join': {
            channel.send({
                embeds: [{
                    color: Colors.Gold,
                    description: `${target} vient de rejoindre une partie de **${gameMapping[gameHost.gameType]}**`,
                    fields: [
                        {
                            name: `Options du jeu :`,
                            value: `**Host :** <@${gameHost.hostID}>\n**Mode :** ${modeMapping[gameHost.gameMode]} joueurs`
                        }
                    ],
                    timestamp: new Date().toISOString(),
                }]
            })
            break;
        }

        case 'type.online.leave': {
            channel.send({
                embeds: [{
                    color: Colors.Gold,
                    description: `<@${target}> vient de quitter une partie de **${gameMapping[gameHost.gameType]}**`,
                    fields: [
                        {
                            name: `Options du jeu :`,
                            value: `**Host :** <@${gameHost.hostID}>\n**Mode :** ${modeMapping[gameHost.gameMode]} joueurs`
                        }
                    ],
                    timestamp: new Date().toISOString(),
                }]
            })
            break;
        }

        case 'type.online.start': {
            channel.send({
                embeds: [{
                    color: Colors.Gold,
                    description: `La partie de **${gameMapping[gameHost.gameType]}** vient de commencer.`,
                    fields: [
                        {
                            name: `Options du jeu :`,
                            value: `**Host :** <@${gameHost.hostID}>\n**Mode :** ${modeMapping[gameHost.gameMode]} joueurs`
                        },
                        {
                            name: `Joueurs :`,
                            value: gameTable.map(player => `<@${player.userID}>`).join(', ') || "Joueurs introuvables."
                        }
                    ],
                    timestamp: new Date().toISOString(),
                }]
            })
            break;
        }

        case 'type.online.end': {
            channel.send({
                embeds: [{
                    color: Colors.Gold,
                    description: `La partie de **${gameMapping[gameHost.gameType]}** vient de se terminée.`,
                    fields: [
                        {
                            name: `Options du jeu :`,
                            value: `**Host :** <@${gameHost.hostID}>\n**Mode :** ${modeMapping[gameHost.gameMode]} joueurs`
                        },
                        {
                            name: `Joueurs :`,
                            value: gameTable?.map(player => `<@${player.userID}>`).join(', ') || "Joueurs introuvables."
                        }
                    ],
                    timestamp: new Date().toISOString(),
                }]
            })
            break;
        }
    }
}

const Logs = {
    VoicesLogs,
    CoinsLogs,
    GamesLogs,
    OnlineLogs
}

module.exports = Logs;