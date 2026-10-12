// currencyRoutes - määrittelee reitit valuuttakurssien hakemiseen ja kurssimuutosten tarkasteluun, vaatii käyttäjältä autentikoinnin
const express = require('express');
const router = express.Router();
const { getRates, getRateChange } = require('../controllers/currencyController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, getRates);
router.get('/change', authenticateToken, getRateChange);

module.exports = router;