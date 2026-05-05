const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const { join } = require('node:path')
const colors = require('colors');

require('dotenv').config()

const client = new Client({
    intents: [ 
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.GuildMember,
        Partials.Reaction,
        Partials.GuildScheduledEvent,
        Partials.User,
        Partials.ThreadMember,
    ]
});


client.commands = new Collection();


client.on('ready', async () => {
    const { Handler } = await require('./handlers');
    const { execute } = await require(join(process.cwd(), 'src', 'events', 'client', 'ready.js'));

    const handler = new Handler(client);

    const commands = await handler.loadCommands();

    // Fetch existing commands to preserve the Entry Point command (type 4)
    // created automatically by Discord when Activities are enabled (error 50240)
    const existing = await client.application.commands.fetch();
    const entryPoints = existing.filter(c => c.type === 4).map(c => ({
        name: c.name,
        description: c.description,
        type: 4,
    }));

    client.application.commands.set([...commands.flat(), ...entryPoints]);

    await handler.loadEvents();

    const { load } = require('./src/website/server/index');
    load(client);

    await execute(client);
})

client.login(process.env.TOKEN)