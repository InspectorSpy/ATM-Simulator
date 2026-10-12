// Accountcard controller - hakee tilityypin kortinumeron perusteella
const accountcardModel = require('../models/accountcardModel');

// Get account type by card number
const getAccountTypeByCardNumber = async (req, res) => {
    const { accounttype, cardnumber } = req.body;

    if (!accounttype || !cardnumber) {
        return res.status(400).json({ error: 'accounttype and cardnumber are required' });
    }

    try {
        const account = await accountcardModel.getAccountTypeByCardNumber(accounttype, cardnumber);
        if (!account || account.length === 0) {
            return res.status(404).json({ error: 'Account not found' });
        }
        res.json(account[0]);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { getAccountTypeByCardNumber };