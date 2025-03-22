const ms = require("parse-ms");

const { connection } = require("../../..");

const Daily = async (user, amount, timeout) => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM jobs WHERE user_id = ?', [user.id], async (err, results) => {
            if (err) {
                console.error('Erreur lors de la récupération des données:', err);
                return reject({ status: 'error', message: 'Erreur lors de la récupération des données.' });
            }

            if (results.length > 0) {
                const lastClaimTimestamp = results[0].daily_timestamp;

                if (lastClaimTimestamp) {
                    const lastClaimTime = new Date(lastClaimTimestamp).getTime();
                    const timeRemaining = timeout - (Date.now() - lastClaimTime);

                    if (timeRemaining > 0) {
                        const time = ms(timeRemaining);
                        return resolve({
                            status: 'cooldown',
                            message: `Vous devez attendre encore **${time.hours}** heure(s), **${time.minutes}** minute(s) et **${time.seconds}** seconde(s) avant de pouvoir réclamer votre récompense quotidienne.`
                        });
                    }
                }

                connection.query('UPDATE jobs SET daily_timestamp = ? WHERE user_id = ?', [new Date(), user.id], (err) => {
                    if (err) {
                        console.error('Erreur lors de l\'update du timestamp:', err);
                        return reject({ status: 'error', message: 'Erreur lors de la mise à jour du timestamp.' });
                    }

                    connection.query('SELECT balance FROM profiles WHERE user_id = ?', [user.id], (err, results) => {
                        if (err) {
                            console.error('Erreur lors de la récupération des coins:', err);
                            return reject({ status: 'error', message: 'Erreur lors de la récupération des coins.' });
                        }

                        if (results.length > 0) {
                            const coins = parseFloat(results[0].balance);
                            const newCoins = (coins + amount).toFixed(2);

                            connection.query('UPDATE profiles SET balance = ? WHERE user_id = ?', [newCoins, user.id], (err) => {
                                if (err) {
                                    console.error('Erreur lors de l\'update des coins:', err);
                                    return reject({ status: 'error', message: 'Erreur lors de la mise à jour des coins.' });
                                }
                                return resolve({
                                    status: 'success',
                                    message: `Vous venez de récupérer vos **${amount} coins** journaliers! Vous avez maintenant **${newCoins} coins**.`
                                });
                            });
                        } else {
                            return reject({ status: 'error', message: 'Profil utilisateur non trouvé.' });
                        }
                    });
                });
            } else {
                connection.query('INSERT INTO jobs (user_id, daily_timestamp) VALUES (?, ?)', [user.id, new Date()], (err) => {
                    if (err) {
                        console.error('Erreur lors de l\'insertion du timestamp:', err);
                        return reject({ status: 'error', message: 'Erreur lors de la création du timestamp.' });
                    }

                    connection.query('SELECT balance FROM profiles WHERE user_id = ?', [user.id], (err, results) => {
                        if (err) {
                            console.error('Erreur lors de la récupération des coins:', err);
                            return reject({ status: 'error', message: 'Erreur lors de la récupération des coins.' });
                        }

                        if (results.length > 0) {
                            const coins = parseFloat(results[0].balance);
                            const newCoins = (coins + amount).toFixed(2);

                            connection.query('UPDATE profiles SET balance = ? WHERE user_id = ?', [newCoins, user.id], (err) => {
                                if (err) {
                                    console.error('Erreur lors de l\'update des coins:', err);
                                    return reject({ status: 'error', message: 'Erreur lors de la mise à jour des coins.' });
                                }
                                return resolve({
                                    status: 'success',
                                    message: `Vous venez de récupérer vos **${amount} coins** journaliers! Vous avez maintenant **${newCoins} coins**.`
                                });
                            });
                        } else {
                            return reject({ status: 'error', message: 'Profil utilisateur non trouvé.' });
                        }
                    });
                });
            }
        });
    });
}

const Work = async (user) => {

}

const Rewards = {
    Daily,
    Work
};

module.exports = Rewards;