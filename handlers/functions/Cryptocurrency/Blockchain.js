const prisma = require('../../database');
const SHA256 = require('crypto-js/sha256');

class Transaction {
    constructor(from, to, amount, type, timestamp = Date.now()) {
        this.from = from;
        this.to = to;
        this.amount = amount;
        this.type = type;
        this.timestamp = timestamp;
    }
}

class Block {
    constructor(timestamp, transactions, previousHash = '') {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.nonce = 0;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        return SHA256(
            `${this.previousHash}${this.timestamp}${JSON.stringify(this.transactions)}${this.nonce}`
        ).toString();
    }

    async mineBlock(difficulty) {
        const prefix = Array(difficulty + 1).join('0');
        while (this.hash.substring(0, difficulty) !== prefix) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        const block = await prisma.blockchainBlock.create({
            data: {
                hash: this.hash,
                previousHash: this.previousHash,
                timestamp: new Date(this.timestamp),
                nonce: this.nonce
            }
        });

        for (const tx of this.transactions) {
            await prisma.blockchainTransaction.create({
                data: {
                    blockHash: this.hash,
                    fromUser: tx.from,
                    toUser: tx.to,
                    amount: tx.amount,
                    type: tx.type,
                    timestamp: new Date(tx.timestamp)
                }
            });
        }

        return block;
    }
}

class CryptoChain {
    constructor() {
        this.chain = [];
        this.pendingTransactions = [];
        this.difficulty = 3;
        this.initialized = false;
    }

    async initialize() {
        const blocks = await prisma.blockchainBlock.findMany({
            orderBy: { timestamp: 'asc' },
            include: { transactions: true }
        });

        if (blocks.length === 0) {
            const genesis = await this.createGenesisBlock();
            this.chain.push(genesis);
        } else {
            for (const block of blocks) {
                this.chain.push(new Block(
                    block.timestamp.getTime(),
                    block.transactions.map(tx => new Transaction(
                        tx.fromUser, tx.toUser, parseFloat(tx.amount), tx.type, tx.timestamp.getTime()
                    )),
                    block.previousHash
                ));
            }
        }

        this.initialized = true;
    }

    async createGenesisBlock() {
        const genesis = new Block(Date.now(), [], '0');
        await genesis.mineBlock(this.difficulty);
        return genesis;
    }
}

module.exports = { Transaction, Block, CryptoChain };
