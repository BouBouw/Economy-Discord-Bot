const { connection } = require("../../..");
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

    mineBlock(difficulty, callback) {
        const prefix = Array(difficulty + 1).join("0");
        while (this.hash.substring(0, difficulty) !== prefix) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        // Enregistrement du bloc
        connection.query(
            'INSERT INTO blockchain_blocks (hash, previous_hash, timestamp, nonce) VALUES (?, ?, ?, ?)',
            [this.hash, this.previousHash, new Date(this.timestamp), this.nonce],
            (err) => {
                if (err) return callback(err);

                // Enregistrement des transactions
                let completed = 0;
                if (this.transactions.length === 0) return callback(null);

                for (const tx of this.transactions) {
                    connection.query(
                        'INSERT INTO blockchain_transactions (block_hash, from_user, to_user, amount, type, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
                        [this.hash, tx.from, tx.to, tx.amount, tx.type, new Date(tx.timestamp)],
                        (err) => {
                            if (err) return callback(err);
                            completed++;
                            if (completed === this.transactions.length) {
                                callback(null);
                            }
                        }
                    );
                }
            }
        );
    }
}

class CryptoChain {
    constructor() {
        this.chain = [];
        this.pendingTransactions = [];
        this.difficulty = 3;
        this.initialized = false;
    }

    initialize(callback) {
        // Chargement de la blockchain depuis MySQL
        connection.query('SELECT * FROM blockchain_blocks ORDER BY timestamp ASC', (err, blocks) => {
            if (err) return callback(err);

            if (blocks.length === 0) {
                this.createGenesisBlock((err, genesis) => {
                    if (err) return callback(err);
                    this.chain.push(genesis);
                    this.initialized = true;
                    callback(null);
                });
            } else {
                let loadedBlocks = 0;
                
                for (const block of blocks) {
                    connection.query(
                        'SELECT * FROM blockchain_transactions WHERE block_hash = ?',
                        [block.hash],
                        (err, txs) => {
                            if (err) return callback(err);

                            this.chain.push(new Block(
                                block.timestamp.getTime(),
                                txs.map(tx => new Transaction(
                                    tx.from_user,
                                    tx.to_user,
                                    parseFloat(tx.amount),
                                    tx.type,
                                    tx.timestamp.getTime()
                                )),
                                block.previous_hash
                            ));

                            loadedBlocks++;
                            if (loadedBlocks === blocks.length) {
                                this.initialized = true;
                                callback(null);
                            }
                        }
                    );
                }
            }
        });
    }

    createGenesisBlock(callback) {
        const genesis = new Block(Date.now(), [], "0");
        genesis.mineBlock(this.difficulty, (err) => {
            if (err) return callback(err);
            callback(null, genesis);
        });
    }

    addTransaction(transaction, callback) {
        if (!this.initialized) {
            return this.initialize(err => {
                if (err) return callback(err);
                this._addTransaction(transaction, callback);
            });
        }
        this._addTransaction(transaction, callback);
    }

    _addTransaction(transaction, callback) {
        this.pendingTransactions.push(transaction);
        
        if (this.pendingTransactions.length >= 10) {
            this.minePendingTransactions(callback);
        } else {
            callback(null);
        }
    }

    minePendingTransactions(callback) {
        const latestBlock = this.chain[this.chain.length - 1];
        const newBlock = new Block(
            Date.now(),
            this.pendingTransactions,
            latestBlock.hash
        );
        
        newBlock.mineBlock(this.difficulty, (err) => {
            if (err) return callback(err);
            this.chain.push(newBlock);
            this.pendingTransactions = [];
            callback(null);
        });
    }

    getBalance(userId, callback) {
        if (!this.initialized) {
            return this.initialize(err => {
                if (err) return callback(err);
                this._getBalance(userId, callback);
            });
        }
        this._getBalance(userId, callback);
    }

    _getBalance(userId, callback) {
        connection.query(
            `SELECT 
                SUM(CASE WHEN to_user = ? THEN amount ELSE 0 END) -
                SUM(CASE WHEN from_user = ? THEN amount ELSE 0 END) as balance
             FROM blockchain_transactions`,
            [userId, userId],
            (err, rows) => {
                if (err) return callback(err);
                callback(null, parseFloat(rows[0].balance) || 0);
            }
        );
    }
}

module.exports = {
    Transaction,
    Block,
    CryptoChain
}