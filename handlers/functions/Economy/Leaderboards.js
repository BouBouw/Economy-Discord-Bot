const prisma = require('../../database');

async function getEconomyLead(sortBy = 'economy', page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    let orderBy;
    switch (sortBy) {
        case 'economy':
            orderBy = [{ balance: 'desc' }, { inBank: 'desc' }];
            break;
        case 'experience':
            orderBy = [{ experiences: 'desc' }];
            break;
        case 'level':
            orderBy = [{ level: 'desc' }];
            break;
        default:
            orderBy = [{ balance: 'desc' }, { inBank: 'desc' }];
    }

    const profiles = await prisma.profile.findMany({
        select: {
            userId: true,
            balance: true,
            inBank: true,
            cryptocurrencies: true,
            experiences: true,
            level: true
        },
        orderBy,
        take: limit,
        skip: offset
    });

    return profiles.map(p => ({
        ...p,
        total_economy: parseFloat(p.balance) + parseFloat(p.inBank) + parseFloat(p.cryptocurrencies)
    }));
}

const Leaderboards = { getEconomyLead };
module.exports = Leaderboards;
