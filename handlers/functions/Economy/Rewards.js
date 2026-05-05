const ms = require('parse-ms');
const prisma = require('../../database');

const Daily = async (user, amount, timeout) => {
    const job = await prisma.job.findFirst({ where: { userId: user.id } });

    if (job) {
        const lastClaimTime = new Date(job.dailyTimestamp).getTime();
        const timeRemaining = timeout - (Date.now() - lastClaimTime);

        if (timeRemaining > 0) {
            const time = ms(timeRemaining);
            return {
                status: 'cooldown',
                message: `Vous devez attendre encore **${time.hours}** heure(s), **${time.minutes}** minute(s) et **${time.seconds}** seconde(s) avant de pouvoir réclamer votre récompense quotidienne.`
            };
        }

        await prisma.job.update({
            where: { id: job.id },
            data: { dailyTimestamp: new Date() }
        });
    } else {
        await prisma.job.create({
            data: { userId: user.id, dailyTimestamp: new Date() }
        });
    }

    const profile = await prisma.profile.findFirst({ where: { userId: user.id } });
    if (!profile) return { status: 'error', message: 'Profil utilisateur non trouvé.' };

    const coins = parseFloat(profile.balance);
    const newCoins = parseFloat((coins + amount).toFixed(2));

    await prisma.profile.updateMany({
        where: { userId: user.id },
        data: { balance: newCoins }
    });

    return {
        status: 'success',
        message: `Vous venez de récupérer vos **${amount} coins** journaliers! Vous avez maintenant **${newCoins} coins**.`
    };
};

const Work = async (user) => {};

const Rewards = { Daily, Work };
module.exports = Rewards;
