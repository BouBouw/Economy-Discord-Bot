const prisma = require('../../database');
const Profiles = require('../Profiles');

const buyToken = async (user, amount) => {
    const profile = await Profiles.getProfile(user);
    const marketData = await Cryptocurrencies.getMarketData();

    const crypto_amount = parseFloat((amount / parseFloat(marketData.currentPrice)).toFixed(2));
    const balance = parseFloat(profile.balance);

    if (balance < Number(amount)) {
        throw new Error("Vous n'avez pas assez d'argent pour acheter cette quantité de tokens.");
    }

    const newBalance = balance - amount;
    const newTokens = parseFloat(profile.cryptocurrencies) + crypto_amount;
    const new_price = parseFloat(marketData.currentPrice) * (1 + 0.05 + (1 - parseFloat(marketData.remainingSupply) / parseFloat(marketData.totalSupply)) * 0.1);
    const remaining_supply = parseFloat(marketData.remainingSupply) - crypto_amount;

    await prisma.$transaction([
        prisma.profile.updateMany({
            where: { userId: user.id },
            data: { balance: newBalance, cryptocurrencies: newTokens }
        }),
        prisma.market.update({
            where: { id: marketData.id },
            data: { currentPrice: new_price, remainingSupply: remaining_supply, updatedAt: new Date() }
        }),
        prisma.transaction.create({
            data: { userId: user.id, transactionType: 2, amount, cryptocurrencie: crypto_amount, reason: 'Achat Crypto-Monnaie' }
        })
    ]);

    return { newBalance, newTokens };
};

const sellToken = async (user, amount) => {
    const profile = await Profiles.getProfile(user);
    const marketData = await Cryptocurrencies.getMarketData();

    const cryptoAmount = parseFloat(amount);
    if (parseFloat(profile.cryptocurrencies) < cryptoAmount) {
        throw new Error("Vous n'avez pas assez de tokens à vendre.");
    }

    const amountInEuros = parseFloat((cryptoAmount * parseFloat(marketData.currentPrice)).toFixed(2));
    const newBalance = parseFloat(profile.balance) + amountInEuros;
    const newTokens = parseFloat(profile.cryptocurrencies) - cryptoAmount;
    const newPrice = parseFloat(marketData.currentPrice) * (1 - 0.05 - (1 - parseFloat(marketData.remainingSupply) / parseFloat(marketData.totalSupply)) * 0.1);
    const remainingSupply = parseFloat(marketData.remainingSupply) + cryptoAmount;

    await prisma.$transaction([
        prisma.profile.updateMany({
            where: { userId: user.id },
            data: { balance: newBalance, cryptocurrencies: newTokens }
        }),
        prisma.market.update({
            where: { id: marketData.id },
            data: { currentPrice: newPrice, remainingSupply, updatedAt: new Date() }
        }),
        prisma.transaction.create({
            data: { userId: user.id, transactionType: 2, amount: amountInEuros, cryptocurrencie: cryptoAmount, reason: 'Vente Crypto-Monnaie' }
        })
    ]);

    return { newBalance, newTokens, amountInEuros };
};

const getMarketData = async () => {
    return prisma.market.findFirst();
};

const calculateTokenPrice = async (user) => {
    const marketData = await getMarketData();
    const profile = await Profiles.getProfile(user);
    return parseFloat(profile.cryptocurrencies) * parseFloat(marketData.currentPrice);
};

const calculateTokenEffect = async (user) => {
    const marketData = await getMarketData();
    const profile = await Profiles.getProfile(user);

    const cryptocurrenciePrice = parseFloat(marketData.cryptocurrenciePrice);
    const currentPrice = parseFloat(marketData.currentPrice);
    const cryptocurrencieAmount = parseFloat(profile.cryptocurrencies);

    if (isNaN(cryptocurrenciePrice) || isNaN(currentPrice) || isNaN(cryptocurrencieAmount)) {
        throw new Error("Les données de marché ou de profil ne sont pas valides.");
    }

    const currentValue = cryptocurrencieAmount * currentPrice;
    const initialValue = cryptocurrencieAmount * cryptocurrenciePrice;
    const profitOrLoss = currentValue - initialValue;
    const percentageChange = initialValue !== 0 ? (profitOrLoss / initialValue) * 100 : 0;
    const isProfit = profitOrLoss > 0;

    return { profitOrLoss, percentageChange, isProfit };
};

const Cryptocurrencies = { buyToken, sellToken, getMarketData, calculateTokenPrice, calculateTokenEffect };
module.exports = Cryptocurrencies;
