const prisma = require('../../database');
const Profiles = require('../Profiles');

const cardMapping = {
    0: { type: 0, sold: 3000, price: 0 },
    1: { type: 1, sold: 5000, price: 500 },
    2: { type: 2, sold: 10000, price: 1000 },
    3: { type: 3, sold: 30000, price: 2000 },
    4: { type: 4, sold: 100000, price: 3000 },
    5: { type: 5, sold: Infinity, price: 5000 }
};

const bankTransfert = async (user, target, amount) => {
    const userProfile = await prisma.profile.findFirst({ where: { userId: user.id } });
    if (!userProfile) throw new Error('Utilisateur non trouvé.');

    const totalBalance = parseFloat(userProfile.balance) + parseFloat(userProfile.inBank);
    if (totalBalance < amount) throw new Error('Solde total insuffisant.');

    const targetProfile = await prisma.profile.findFirst({ where: { userId: target.id } });
    if (!targetProfile) throw new Error('Cible non trouvée.');

    let remainingAmount = parseFloat(amount);
    let newUserBalance = parseFloat(userProfile.balance);
    let newUserBankBalance = parseFloat(userProfile.inBank);

    if (newUserBalance >= remainingAmount) {
        newUserBalance -= remainingAmount;
    } else {
        remainingAmount -= newUserBalance;
        newUserBalance = 0;
        newUserBankBalance -= remainingAmount;
    }

    await prisma.$transaction([
        prisma.profile.updateMany({
            where: { userId: target.id },
            data: { balance: parseFloat(targetProfile.balance) + parseFloat(amount) }
        }),
        prisma.profile.updateMany({
            where: { userId: user.id },
            data: { balance: newUserBalance, inBank: newUserBankBalance }
        })
    ]);

    return true;
};

const getAccountTransactions = async (user) => {
    return prisma.transaction.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 3
    });
};

const bankDepositAmount = async (user, amount) => {
    const profile = await prisma.profile.findFirst({ where: { userId: user.id } });
    if (!profile) return false;

    const balance = parseFloat(profile.balance);
    if (balance <= 0 || balance < amount) return false;

    await prisma.profile.updateMany({
        where: { userId: user.id },
        data: {
            balance: balance - parseFloat(amount),
            inBank: parseFloat(profile.inBank) + parseFloat(amount)
        }
    });
    return true;
};

const bankDepositAll = async (user) => {
    const profile = await prisma.profile.findFirst({ where: { userId: user.id } });
    if (!profile) return false;

    const balance = parseFloat(profile.balance);
    if (balance <= 0) return false;

    await prisma.profile.updateMany({
        where: { userId: user.id },
        data: {
            balance: 0,
            inBank: parseFloat(profile.inBank) + balance
        }
    });
    return true;
};

const bankWithdrawAmount = async (user, amount) => {
    const profile = await prisma.profile.findFirst({ where: { userId: user.id } });
    if (!profile) return false;

    const inBank = parseFloat(profile.inBank);
    if (inBank <= 0 || inBank < amount) return false;

    await prisma.profile.updateMany({
        where: { userId: user.id },
        data: {
            balance: parseFloat(profile.balance) + parseFloat(amount),
            inBank: inBank - parseFloat(amount)
        }
    });
    return true;
};

const bankWithdrawAll = async (user) => {
    const profile = await prisma.profile.findFirst({ where: { userId: user.id } });
    if (!profile) return false;

    const inBank = parseFloat(profile.inBank);
    if (inBank <= 0) return false;

    await prisma.profile.updateMany({
        where: { userId: user.id },
        data: {
            balance: parseFloat(profile.balance) + inBank,
            inBank: 0
        }
    });
    return true;
};

const bankWallet = async (user) => {
    const profile = await prisma.profile.findFirst({
        where: { userId: user.id },
        select: { cryptocurrencies: true }
    });
    return profile;
};

const bankCreditCard = async (user) => {
    const profile = await Profiles.getProfile(user);

    if (profile.creditCard === 5) {
        return { current_card: cardMapping[profile.creditCard], next_card: null };
    }
    return {
        current_card: cardMapping[profile.creditCard],
        next_card: cardMapping[profile.creditCard + 1]
    };
};

const bankMonthAmount = async (user) => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const result = await prisma.transaction.aggregate({
        where: {
            userId: user.id,
            transactionType: 0,
            createdAt: { gte: firstDayOfMonth }
        },
        _sum: { amount: true }
    });

    return { total_amount: result._sum.amount || 0 };
};

const Bank = {
    bankTransfert,
    getAccountTransactions,
    bankDepositAmount,
    bankDepositAll,
    bankWithdrawAmount,
    bankWithdrawAll,
    bankWallet,
    bankCreditCard,
    bankMonthAmount
};

module.exports = Bank;
