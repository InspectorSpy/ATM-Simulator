// Card controller - hoitaa korttien kirjautumisen, korttien luomisen, korttien päivittämisen ja korttien poistamisen
const cardModel = require('../models/cardModel');
const accountModel = require('../models/accountModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// Validation rules
const loginValidation = [
    body('cardnumber').trim().isLength({ min: 1, max: 20 }).isAlphanumeric(),
    body('pin').trim().isLength({ min: 4, max: 4 }).isNumeric()
];

// Validation rules for creating a card
const createCardValidation = [
    body('cardnumber').trim().isLength({ min: 1, max: 20 }).escape(),
    body('pin').trim().isLength({ min: 4, max: 4 }).isNumeric()
];

// Login function
const login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid input' });
    }
    const { cardnumber, pin } = req.body;

    if (!cardnumber || !pin) {
        return res.status(400).json({ error: 'Card number and PIN are required' });
    }

    try {
        const card = await cardModel.findByCardNumber(cardnumber);

        if (!card) {
            return res.status(401).json({ error: 'Invalid card number or PIN' });
        }

        if (!card.active) {
            return res.status(403).json({ error: 'Card is locked. Please contact the bank.'});
        }

        const isMatch = await bcrypt.compare(pin, card.pin);

        if (!isMatch) {
            const newAttempts = card.failed_attempts + 1;

            if (newAttempts >= 3) {
                await cardModel.lockCard(card.idcard, newAttempts);
                return res.status(403).json({ error: 'Card locked due to too many failed attempts. Please contact the bank.' });
            }

            await cardModel.updateFailedAttempts(card.idcard, newAttempts);
            return res.status(401).json({ error: 'Invalid card number or PIN', attemptsLeft: 3 - newAttempts });
        }

        await cardModel.resetFailedAttempts(card.idcard);

        const accounts = await accountModel.getByCardId(card.idcard);

        const token = jwt.sign(
            { idcard: card.idcard, accounts: accounts.map(a => a.idaccount) },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.json({ token });
    } catch (error) {
        console.error('login error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

// Logout function
const logout = async (req, res) => {
    res.json({ message: 'Logged out succesfully' });
};

// Get all cards
const getAllCards = async (req, res) => {
    try {
        const cards = await cardModel.getAll();
        res.json(cards);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Get card by id
const getCardById = async (req, res) => {
    try {
        const card = await cardModel.findById(req.params.idcard);
        if (!card) return res.status(404).json({ error: 'Card not found' });
        res.json(card);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Create a new card
const createCard = async (req, res) => {
    const { cardnumber, pin } = req.body;

    if (!cardnumber || !pin) return res.status(400).json({ error: 'cardnumber and pin are required' });

    try {
        const pinHash = await bcrypt.hash(pin, 10);
        const result = await cardModel.createCard(cardnumber, pinHash);
        res.status(201).json({ idcard: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }

};

// Update card details
const updateCard = async (req, res) => {
    const { cardnumber, active } = req.body;
    try {
        await cardModel.updateCardStatus(req.params.idcard, cardnumber, active);
        res.json({ message: 'Card updated' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }

};

// Delete a card
const deleteCard = async (req, res) => {
    try {
        await cardModel.removeCard(req.params.idcard);
        res.json({ message: 'Card deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { login, logout, getAllCards, getCardById, createCard, updateCard, deleteCard, loginValidation, createCardValidation  };
