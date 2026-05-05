const prisma = require('../../database');

class CryptoMarket {
    constructor() {
        this.price = 10;
        this.volatility = 0.07;
        this.trend = 0;
        this.marketSentiment = 0.5;
        this.lastUpdate = Date.now();
    }

    async updatePrice() {
        const oneDayAgo = new Date(Date.now() - 24 * 3600 * 1000);

        const [txCount, volume] = await Promise.all([
            prisma.blockchainTransaction.count({ where: { timestamp: { gte: oneDayAgo } } }),
            prisma.blockchainTransaction.aggregate({
                where: { timestamp: { gte: oneDayAgo } },
                _sum: { amount: true }
            })
        ]);

        const txActivity = Math.min(1, txCount / 100);
        const volumeImpact = Math.min(1, parseFloat(volume._sum.amount || 0) / 10000) * 0.1;

        const randomFactor = (Math.random() - 0.5) * this.volatility * 2;
        const trendImpact = this.trend * 0.01;
        const activityImpact = txActivity * 0.02;

        const change = randomFactor + trendImpact + activityImpact + volumeImpact;
        this.price = Math.max(0.01, this.price * (1 + change));
        this.trend = this.trend * 0.7 + (change > 0 ? 0.1 : -0.1);
        this.lastUpdate = Date.now();

        await prisma.cryptoHistory.create({
            data: { price: this.price, timestamp: new Date() }
        });

        return this.price;
    }

    async getPriceHistory(days = 7) {
        const rows = await prisma.cryptoHistory.findMany({
            where: { timestamp: { gte: new Date(Date.now() - days * 24 * 3600 * 1000) } },
            orderBy: { timestamp: 'asc' }
        });

        return rows.map(row => ({
            price: parseFloat(row.price),
            timestamp: row.timestamp.getTime()
        }));
    }

    async generatePriceChart() {
        const history = await this.getPriceHistory(7);
        const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
        const chartJS = new ChartJSNodeCanvas({ width: 800, height: 400 });

        return chartJS.renderToBuffer({
            type: 'line',
            data: {
                labels: history.map((_, i) => `J-${7 - i}`),
                datasets: [{
                    label: 'Price',
                    data: history.map(h => h.price),
                    borderColor: '#4bc0c0',
                    tension: 0.1
                }]
            }
        });
    }
}

module.exports = { CryptoMarket };
