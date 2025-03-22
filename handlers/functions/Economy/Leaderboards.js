const { connection } = require("../../..");

async function getEconomyLead(sortBy = 'economy', page = 1, limit = 10) {
    return new Promise((resolve, reject) => {
        try {
            const offset = (page - 1) * limit;

            let orderBy;
            switch (sortBy) {
                case 'economy':
                    orderBy = '(balance + in_bank + cryptocurrencies) DESC';
                    break;
                case 'experience':
                    orderBy = 'experience DESC';
                    break;
                case 'level':
                    orderBy = 'level DESC';
                    break;
                default:
                    orderBy = '(balance + in_bank + cryptocurrencies) DESC';
            }

            const query = `
                SELECT 
                    user_id, 
                    balance, 
                    in_bank, 
                    cryptocurrencies, 
                    experiences, 
                    level,
                    (balance + in_bank + cryptocurrencies) AS total_economy
                FROM profiles
                ORDER BY ${orderBy}
                LIMIT ? OFFSET ?;
            `;

            connection.query(query, [limit, offset], function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        } catch (err) {
            reject(err);
        }
    });
}

const Leaderboards = {
    getEconomyLead
}

module.exports = Leaderboards;