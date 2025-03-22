const { connection } = require("../../..");
const Profiles = require("../Profiles");

const buyToken = async (user, amount) => {
    const profile = await Profiles.getProfile(user);
    const marketData = await Cryptocurrencies.getMarketData();

    const crypto_amount = parseFloat((amount / marketData.current_price).toFixed(2));

    const balance = profile.balance;

    console.log(amount)

    if (Number(balance) < Number(amount)) {
        throw new Error("Vous n'avez pas assez d'argent pour acheter cette quantité de tokens.");
    }

    const newBalance = balance - amount;
    const newTokens = profile.cryptocurrencies + crypto_amount;

    connection.query('UPDATE profiles SET balance = ?, cryptocurrencies = ? WHERE user_id = ?', [newBalance, newTokens, user.id], (err) => {
        if (err) {
            throw new Error("Erreur lors de l'achat de tokens.");
        }
    });

    const new_price = (Number(marketData.current_price) * (1 + 0.05 + (1 - Number(marketData.remaining_supply) / Number(marketData.total_supply)) * 0.1));
    const remaining_supply = (Number(marketData.remaining_supply) - Number(crypto_amount));
    connection.query(`UPDATE market SET current_price = ?, remaining_supply = ?, updated_at = ? WHERE id = ?`, [new_price, remaining_supply, new Date(), 1], (err) => {
        if(err) {
            console.log(err)
            throw new Error("Erreur lors de la mise à jour du marché.");
        }
    })

    connection.query(`INSERT INTO transactions (user_id, transaction_type, amount, cryptocurrencie, reason) VALUES (?, ?, ?, ?)`, [user.id, 2, amount, crypto_amount, 'Achat Crypto-Monnaie'], (err) => {
        if(err) {
            throw new Error("Erreur lors de la mise à jour des transactions.");
        }
    })

    return {
        newBalance,
        newTokens
    };
}

const sellToken = async (user, amount) => {
    const profile = await Profiles.getProfile(user);
    const marketData = await Cryptocurrencies.getMarketData();

    const cryptoAmount = parseFloat(amount);

    if (profile.cryptocurrencies < cryptoAmount) {
        throw new Error("Vous n'avez pas assez de tokens à vendre.");
    }

    const amountInEuros = parseFloat((cryptoAmount * marketData.current_price).toFixed(2));

    const newBalance = profile.balance + amountInEuros;
    const newTokens = profile.cryptocurrencies - cryptoAmount;

    connection.query(
        'UPDATE profiles SET balance = ?, cryptocurrencies = ? WHERE user_id = ?',
        [newBalance, newTokens, user.id],
        (err) => {
            if (err) {
                throw new Error("Erreur lors de la vente de tokens.");
            }
        }
    );

    const newPrice = (Number(marketData.current_price) * (1 - 0.05 - (1 - Number(marketData.remaining_supply) / Number(marketData.total_supply)) * 0.1));
    const remainingSupply = (Number(marketData.remaining_supply) + Number(cryptoAmount));

    connection.query(
        `UPDATE market SET current_price = ?, remaining_supply = ?, updated_at = ? WHERE id = ?`,
        [newPrice, remainingSupply, new Date(), 1],
        (err) => {
            if (err) {
                console.error(err);
                throw new Error("Erreur lors de la mise à jour du marché.");
            }
        }
    );

    connection.query(`INSERT INTO transactions (user_id, transaction_type, amount, cryptocurrencie, reason) VALUES (?, ?, ?, ?)`, [user.id, 2, amountInEuros, cryptoAmount, 'Vente Crypto-Monnaie'], (err) => {
        if(err) {
            throw new Error("Erreur lors de la mise à jour des transactions.");
        }
    })

    return {
        newBalance,
        newTokens,
        amountInEuros
    };
}

const getMarketData = () => {
    return new Promise((resolve, reject) => {
        try {
            connection.query('SELECT * FROM market', function(err, result) {
                if(err) throw err;
                resolve(result[0]);
            })
        } catch(err) {
            reject(err);
        }
    })
}

const calculateTokenPrice = async (user) => {
    const marketData = await getMarketData();
    const profile = await Profiles.getProfile(user);

    const price = profile.cryptocurrencies * marketData.current_price;
    return price;
}

const calculateTokenEffect = async (user) => {
    const marketData = await getMarketData();
    const profile = await Profiles.getProfile(user);

    const cryptocurrenciePrice = Number(marketData.cryptocurrencie_price);
    const currentPrice = Number(marketData.current_price);
    const cryptocurrencieAmount = Number(profile.cryptocurrencies);

    if (isNaN(cryptocurrenciePrice) || isNaN(currentPrice) || isNaN(cryptocurrencieAmount)) {
        throw new Error("Les données de marché ou de profil ne sont pas valides.");
    }

    const currentValue = cryptocurrencieAmount * currentPrice;
    const initialValue = cryptocurrencieAmount * cryptocurrenciePrice;
    const profitOrLoss = currentValue - initialValue;
    const percentageChange = (profitOrLoss / initialValue) * 100;
    const isProfit = profitOrLoss > 0;

    return {
        profitOrLoss, // Profit ou perte en valeur absolue
        percentageChange, // Pourcentage de gain ou de perte
        isProfit // true si gain, false si perte
    };
}

const Cryptocurrencies = {
    buyToken,
    sellToken,
    getMarketData,
    calculateTokenPrice,
    calculateTokenEffect
};

module.exports = Cryptocurrencies;