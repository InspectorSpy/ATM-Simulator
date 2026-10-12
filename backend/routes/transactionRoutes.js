// Transaction routes - hakee tilitapahtumat, suorittaa nosto-, talletus- ja siirtotapahtumia, hakee yksittäisen tapahtuman ja poistaa tapahtuman
const express = require('express');
const router = express.Router();
const { getTransactions, withdraw, deposit, transfer, getTransactionById, deleteTransaction } = require('../controllers/transactionController');
const { authenticateToken } = require('../middleware/auth');

router.get('/:idaccount', authenticateToken, getTransactions);
router.get('/transaction/:idtransactions', authenticateToken, getTransactionById);
router.post('/withdraw', authenticateToken, withdraw);
router.post('/deposit', authenticateToken, deposit);
router.post('/transfer', authenticateToken, transfer);
router.delete('/transaction/:idtransactions', authenticateToken, deleteTransaction);

module.exports = router;