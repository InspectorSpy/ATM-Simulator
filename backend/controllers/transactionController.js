// Transaction controller - hakee tilitapahtumat, suorittaa nostoja, talletuksia ja siirtoja, hakee yksittäisen tapahtuman ja poistaa tapahtuman
const transactionModel = require('../models/transactionModel');

// Get transactions for an account
const getTransactions = async (req, res) => {
    const idaccount = parseInt(req.params.idaccount);
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    if (!req.user.accounts.includes(idaccount)) {
        return res.status(403).json({ error: 'Access denied' });
    }

    try {
        const total = await transactionModel.countByAccount(idaccount);
        const rows = await transactionModel.getByAccount(idaccount, limit, offset);

        if (rows.length === 0) return res.status(404).json({ error: 'No transactions found' });

        return res.json({
            page,
            totalPages: Math.ceil(total / limit),
            transactions: rows
        });
    } catch (error) {
        console.error('getTransactions error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

// Withdraw from account
const withdraw = async (req, res) => {
    const { idaccount, amount } = req.body;

    if (!idaccount || !amount || amount <= 0) {
        return res.status(400).json({ error: 'Valid account ID and amount are required' });
    }

    if (!req.user.accounts.includes(parseInt(idaccount))) {
        return res.status(403).json({ error: 'Access denied' });
    }

    try {
        const result = await transactionModel.withdraw(idaccount, amount);
        return res.status(result.status).json(result.error ? { error: result.error } : { message: result.message, amount: result.amount });
    } catch (error) {
        console.error('withdraw error:', error.message);
        return res.status(500).json({ error: 'Server error' });
    }
};

// Deposit to account
const deposit = async (req, res) => {
    const { idaccount, amount } = req.body;

    if (!idaccount || !amount || amount <= 0) {
        return res.status(400).json({ error: 'Valid account ID and amount are required' });
    }

    if (!req.user.accounts.includes(parseInt(idaccount))) {
        return res.status(403).json({ error: 'Access denied' });
    }

    try {
        const result = await transactionModel.deposit(idaccount, amount);
        return res.status(result.status).json(result.error ? { error: result.error } : { message: result.message, amount: result.amount });
    } catch (error) {
        console.error('deposit error:', error.message);
        return res.status(500).json({ error: 'Server error' });
    }
};

// Transfer between accounts
const transfer = async (req, res) => {
    const { idaccount, targetaccountnumber, amount } = req.body;

    if (!idaccount || !targetaccountnumber || !amount || amount <= 0) {
        return res.status(400).json({ error: 'Source account, target account and amount are required' });
    }

    if (!req.user.accounts.includes(parseInt(idaccount))) {
        return res.status(403).json({ error: 'Access denied' });
    }

    try {
        const result = await transactionModel.transfer(idaccount, targetaccountnumber, amount);
        return res.status(result.status).json(result.error ? { error: result.error } : { message: result.message, amount: result.amount, targetaccountnumber: result.targetaccountnumber });
    } catch (error) {
        console.error('transfer error:', error.message);
        return res.status(500).json({ error: 'server error' });
    }
};

// Get transaction by id
const getTransactionById = async (req, res) => {
    try {
        const transaction = await transactionModel.findById(req.params.idtransactions);
        if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ error: 'server error' });
    }
};

// Delete a transaction
const deleteTransaction = async (req, res) => {
    try {
        await transactionModel.removeTransaction(req.params.idtransactions);
        res.json({ message: 'Transaction deleted' });
    } catch (error) {
        res.status(500).json({ error: 'server error' });
    }
};

module.exports = { getTransactions, withdraw, deposit, transfer, getTransactionById, deleteTransaction };