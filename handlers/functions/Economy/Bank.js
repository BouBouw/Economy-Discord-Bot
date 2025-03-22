const { connection } = require("../../..");
const Profiles = require("../Profiles");

const cardMapping = {
    0: {
        type: 0,
        sold: 3000,
        price: 0
    },
    1: {
        type: 1,
        sold: 5000,
        price: 500
    },
    2: {
        type: 2,
        sold: 10000,
        price: 1000
    },
    3: {
        type: 3,
        sold: 30000,
        price: 2000
    },
    4: {
        type: 4,
        sold: 100000,
        price: 3000
    },
    5: {
        type: 5,
        sold: Infinity,
        price: 5000
    }
}

const bankTransfert = async (user, target, amount) => {
    return new Promise((resolve, reject) => {
        try {
            // Vérifier le solde de l'utilisateur (balance et in_bank)
            connection.query(
                `SELECT balance, in_bank FROM profiles WHERE user_id = ?`,
                [user.id],
                function (err, result) {
                    if (err) return reject(err);

                    // Vérifier si l'utilisateur existe
                    if (!result[0]) {
                        return reject("Utilisateur non trouvé.");
                    }

                    const { balance: userBalance, in_bank: userBankBalance } = result[0];
                    const totalBalance = parseFloat(userBalance) + parseFloat(userBankBalance);

                    // Vérifier si le solde total est suffisant
                    if (totalBalance < amount) {
                        return reject("Solde total insuffisant.");
                    }

                    // Vérifier le solde de la cible
                    connection.query(
                        `SELECT balance FROM profiles WHERE user_id = ?`,
                        [target.id],
                        function (err, result) {
                            if (err) return reject(err);

                            // Vérifier si la cible existe
                            if (!result[0]) {
                                return reject("Cible non trouvée.");
                            }

                            const { balance: targetBalance } = result[0];

                            // Mettre à jour le solde de la cible
                            const newTargetBalance = parseFloat(targetBalance) + parseFloat(amount);
                            connection.query(
                                `UPDATE profiles SET balance = ? WHERE user_id = ?`,
                                [newTargetBalance, target.id],
                                function (err, result) {
                                    if (err) return reject(err);

                                    // Calculer le montant à prélever
                                    let remainingAmount = parseFloat(amount);
                                    let newUserBalance = parseFloat(userBalance);
                                    let newUserBankBalance = parseFloat(userBankBalance);

                                    // Prélever d'abord du solde en poche
                                    if (newUserBalance >= remainingAmount) {
                                        newUserBalance -= remainingAmount;
                                    } else {
                                        remainingAmount -= newUserBalance;
                                        newUserBalance = 0;

                                        // Prélever le reste du compte en banque
                                        newUserBankBalance -= remainingAmount;
                                    }

                                    // Mettre à jour le solde de l'utilisateur
                                    connection.query(
                                        `UPDATE profiles SET balance = ?, in_bank = ? WHERE user_id = ?`,
                                        [newUserBalance, newUserBankBalance, user.id],
                                        function (err, result) {
                                            if (err) return reject(err);
                                            resolve(true); // Transfert réussi
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        } catch (err) {
            reject(err); // Rejeter l'erreur en cas de problème
        }
    });
};

const getAccountTransactions = async (user) => {
    return new Promise((resolve, reject) => {
        try {
            connection.query(`SELECT * 
            FROM transactions 
            WHERE user_id = '${user.id}' 
            ORDER BY created_at DESC 
            LIMIT 3`, function(err, result) {
                if(err) throw err;
                resolve(result);
            })
        } catch(err) {
            reject(err);
        }
    })
}

const bankDepositAmount = (user, amount) => {
    return new Promise((resolve, reject) => {
        try {
            connection.query(`SELECT balance, in_bank
            FROM profiles
            WHERE user_id = '${user.id}'`, function(err, result) {
                if(err) throw err;

                const { balance, in_bank } = result[0];
                if(balance <= 0 || balance < amount) return reject(false);

                const newBalance = parseFloat(balance) - parseFloat(amount);
                const newInBank = parseFloat(in_bank) + parseFloat(amount);
                connection.query(`UPDATE profiles
                SET balance = ${newBalance}, in_bank = ${newInBank}
                WHERE user_id = '${user.id}'`, function(err, result) {
                    if(err) throw err;
                    resolve(true);
                })
            })
        } catch(err) {
            reject(false)
        }
    })
}

const bankDepositAll = (user) => {
    return new Promise((resolve, reject) => {
        try {
            connection.query(`SELECT balance, in_bank
            FROM profiles
            WHERE user_id = '${user.id}'`, function(err, result) {
                if(err) throw err;

                const { balance, in_bank } = result[0];
                if(balance <= 0) return reject(false);

                const newInBank = parseFloat(in_bank) + parseFloat(balance);
                connection.query(`UPDATE profiles
                SET balance = 0, in_bank = ${newInBank}
                WHERE user_id = '${user.id}'`, function(err, result) {
                    if(err) throw err;
                    resolve(true);
                })
            })
        } catch(err) {
            reject(false)
        }
    })
}

const bankWithdrawAmount = (user, amount) => {
    return new Promise((resolve, reject) => {
        try {
            connection.query(`SELECT balance, in_bank
            FROM profiles
            WHERE user_id = '${user.id}'`, function(err, result) {
                if(err) throw err;

                const { balance, in_bank } = result[0];
                if(in_bank <= 0 || in_bank < amount) return reject(false);

                const newBalance = parseFloat(balance) + parseFloat(amount);
                const newInBank = parseFloat(in_bank) - parseFloat(amount);
                connection.query(`UPDATE profiles
                SET balance = ${newBalance}, in_bank = ${newInBank}
                WHERE user_id = '${user.id}'`, function(err, result) {
                    if(err) throw err;
                    resolve(true);
                })
            })
        } catch(err) {
            reject(false)
        }
    })
}

const bankWithdrawAll = (user) => {
    return new Promise((resolve, reject) => {
        try {
            connection.query(`SELECT balance, in_bank
            FROM profiles
            WHERE user_id = '${user.id}'`, function(err, result) {
                if(err) throw err;

                const { balance, in_bank } = result[0];
                if(in_bank <= 0) return reject(false);

                const newBalance = parseFloat(balance) + parseFloat(in_bank);
                connection.query(`UPDATE profiles
                SET balance = ${newBalance}, in_bank = 0
                WHERE user_id = '${user.id}'`, function(err, result) {
                    if(err) throw err;
                    resolve(true);
                })
            })
        } catch(err) {
            reject(false)
        }
    })
}

const bankWallet = (user) => {
    return new Promise((resolve, reject) => {
        try {
            connection.query(`SELECT crytpocurrencies
            FROM profiles
            WHERE user_id = '${user.id}'`, function(err, result) {
                if(err) throw err;
                resolve(result[0]);
            })
        } catch(err) {
            reject(false)
        }
    })
}

const bankCreditCard = async (user) => {
    const profile = await Profiles.getProfile(user);
    
    if(profile.credit_card === 5) {
        const card = cardMapping[profile.credit_card];
        return {
            current_card: card,
            next_card: null
        }
    } else {
        const card = cardMapping[profile.credit_card];
        const nextCard = cardMapping[profile.credit_card + 1];
        return {
            current_card: card,
            next_card: nextCard
        }
    }
}

const bankMonthAmount = async (user) => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT SUM(amount) AS total_amount
            FROM transactions
        WHERE transaction_type = 0
        AND created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')
        AND user_id = ?`, [user.id], function(err, result) {
            console.log(result)
            if(err) throw err;
            resolve(result[0]);
        })
    });
}

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
}

module.exports = Bank