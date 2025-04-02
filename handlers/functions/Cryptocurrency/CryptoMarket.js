const { connection } = require("../../..");

class CryptoMarket {
    constructor() {
        this.price = 10;
        this.volatility = 0.07;
        this.trend = 0;
        this.marketSentiment = 0.5; // 0-1
        this.lastUpdate = Date.now();
    }

    async updatePrice() {
        // Facteurs de marché
        const [result] = await connection.query(
            'SELECT COUNT(*) as txCount, SUM(amount) as volume FROM blockchain_transactions WHERE timestamp >= ?',
            [new Date(Date.now() - 24 * 3600 * 1000)]
        );
        
        const txActivity = Math.min(1, result[0].txCount / 100);
        const volumeImpact = Math.min(1, result[0].volume / 10000) * 0.1;
        
        // Calcul du nouveau prix
        const randomFactor = (Math.random() - 0.5) * this.volatility * 2;
        const trendImpact = this.trend * 0.01;
        const activityImpact = txActivity * 0.02;
        
        const change = randomFactor + trendImpact + activityImpact + volumeImpact;
        this.price = Math.max(0.01, this.price * (1 + change));
        
        // Mettre à jour la tendance
        this.trend = this.trend * 0.7 + (change > 0 ? 0.1 : -0.1);
        this.lastUpdate = Date.now();
        
        // Enregistrer dans MySQL
        await connection.execute(
            'INSERT INTO crypto_history (price, timestamp) VALUES (?, ?)',
            [this.price, new Date()]
        );
        
        return this.price;
    }

    async getPriceHistory(days = 7) {
        const [rows] = await connection.query(
            'SELECT price, timestamp FROM crypto_history WHERE timestamp >= ? ORDER BY timestamp ASC',
            [new Date(Date.now() - days * 24 * 3600 * 1000)]
        );
        
        return rows.map(row => ({
            price: parseFloat(row.price),
            timestamp: row.timestamp.getTime()
        }));
    }

    async generatePriceChart() {
        const history = await this.getPriceHistory(7);
        const width = 800;
        const height = 400;
        
        const chartJS = new ChartJSNodeCanvas({ width, height });
        const image = await chartJS.renderToBuffer({
            type: 'line',
            data: {
                labels: history.map((_, i) => `J-${7 - i}`),
                datasets: [{
                    label: `${config.cryptoName} Price (${config.symbol})`,
                    data: history.map(h => h.price),
                    borderColor: '#4bc0c0',
                    tension: 0.1
                }]
            }
        });
        
        return image;
    }
}

module.exports = {
    CryptoMarket
}