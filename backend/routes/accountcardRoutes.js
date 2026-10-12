// AccountCard routes - hakee tilityypin korttinumeroa vastaavalle tilille
const express = require('express');
const router = express.Router();
const { getAccountTypeByCardNumber } = require('../controllers/accountcardController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, getAccountTypeByCardNumber);

module.exports = router;