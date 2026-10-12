// Account routes - hakee tilitiedot idaccountin perusteella
const express = require('express');
const router = express.Router();
const { getAccountDetails } = require('../controllers/accountController');
const { authenticateToken } = require('../middleware/auth');

router.get('/:idaccount', authenticateToken, getAccountDetails);

module.exports = router;