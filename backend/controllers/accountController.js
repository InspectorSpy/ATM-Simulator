// Account controller - hakee tilitiedot idaccountin perusteella, hakee kaikki tilit, luo tilin, päivittää tilin ja poistaa tilin
const accountModel = require('../models/accountModel');

// Get account details
const getAccountDetails = async (req, res) => {
    const idaccount = req.params.idaccount;

    // Validate account to card
    if (!req.user.accounts.includes(parseInt(idaccount))) {
        return res.status(403).json({ error: 'Access denied' });
    }

    try {
        const account = await accountModel.findById(idaccount);

        if (!account) return res.status(404).json({ error: 'Account not found' });
        res.json(account);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Get all accounts
const getAllAccounts = async (req, res) => {
    try {
        const accounts = await accountModel.getAll();
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Create a new account
const createAccount = async (req, res) => {
    const { idcustomer, balance, creditlimit, accountnumber, accounttype } = req.body;
    if (!idcustomer || !accountnumber || !accounttype) {
        return res.status(400).json({ error: 'idcustomer, accountnumber and accounttype are required' });
    }

    try {
        const result = await accountModel.createAccount(idcustomer, balance || 0, creditlimit || 0, accountnumber, accounttype);
        res.status(201).json({ idaccount: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Update account details
const updateAccount = async (req, res) => {
    const { balance, creditlimit, accountnumber, accounttype } = req.body;
    try {
        await accountModel.updateAccount(req.params.idaccount, balance, creditlimit, accountnumber, accounttype);
        res.json({ message: 'Account updated' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete an account
const deleteAccount = async (req, res) => {
    try {
        await accountModel.removeAccount(req.params.idaccount);
        res.json({ message: 'Account deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { getAccountDetails, getAllAccounts, createAccount, updateAccount, deleteAccount };