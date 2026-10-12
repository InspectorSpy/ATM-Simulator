// Customer routes - hakee asiakkaan tiedot ja tilitiedot cardnumberin perusteella
const express = require('express');
const router = express.Router();
const { getCustomerDetails } = require('../controllers/customerController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, getCustomerDetails);

module.exports = router;