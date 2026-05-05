const { readdirSync } = require('node:fs');
const { lstat } = require('node:fs/promises');
const { join } = require('node:path')

class Handler {
    allowedExts = ['js']
    commands = []

    client

    constructor (client) {
        this.client = client
    }

    async connectDatabase () {
        try {
            const prisma = require('./database');
            await prisma.$connect();
            console.log(`[DB]`.bold.white + ` Prisma connected to PostgreSQL!`.bold.green);
        } catch (error) {
            throw new Error(error)
        }
    }

    async loadCommands (directory = 'src/commands') {
        return Promise.all(
            readdirSync(directory).flatMap(async (path) => {
                const location = join(directory, path)
                const stat = await lstat(location)
    
                if (stat.isDirectory()) {
                    return this.loadCommands(location)
                }

                if (stat.isFile() && this.fileHasValidExtension(location)) {
                    const command = await require(join(process.cwd(), location))
                    
                    this.client.commands.set(command.name, command)

                    console.log('[CMDS]'.bold.cyan + ' Loading commands :'.bold.white + ` ${command.name}`.bold.cyan);
                    return command
                }

            })
        )
    }

    async loadEvents (directory = 'src/events') {
        return Promise.all(
            readdirSync(directory).map(async (path) => {
                const location = join(directory, path)
                const stat = await lstat(location)
                
                if (stat.isDirectory()) {
                    await this.loadEvents(location)
                }
    
                if (stat.isFile() && this.fileHasValidExtension(location)) {
                    const { name, execute } = await require(join(process.cwd(), location))
                    
                    this.client.on(name, (...args) => execute(...args, this.client))
                    console.log('[EVENTS]'.bold.yellow + ' Loading event :'.bold.white + ` ${name}`.bold.yellow);
                }
            })
        )
    }
    
    fileHasValidExtension (path) {
        const uri = path.split('.')
        return this.allowedExts.some((element) => element == uri[uri.length - 1])
    }

}

module.exports = {
    Handler
}