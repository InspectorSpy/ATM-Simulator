// Card routes - hakee korttitiedot, luo, päivittää ja poistaa kortteja, sekä hoitaa kirjautumisen ja uloskirjautumisen
const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { login, logout, getAllCards, getCardById, createCard, updateCard, deleteCard, loginValidation, createCardValidation } = require('../controllers/cardController');
const { authenticateToken } = require('../middleware/auth');

// Rajoittaa kirjautumisyrityksiä 10 yritykseen 15 minuutissa IP-osoitetta kohden
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Too many login attempts, please try again later' }
});

// Routes
router.post('/login', loginLimiter, loginValidation, login);
router.post('/logout', logout);
router.get('/', authenticateToken, getAllCards);
router.get('/:idcard', authenticateToken, getCardById);
router.post('/', authenticateToken, createCardValidation, createCard);
router.put('/:idcard', authenticateToken, updateCard);
router.delete('/:idcard', authenticateToken, deleteCard);

module.exports = router;