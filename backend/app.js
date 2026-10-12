// app.js - pääasiallinen Express-sovellus, joka määrittelee middlewaret, reitit ja virheenkäsittelyn
const express = require('express');
const logger = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config(); 

const cardRoutes = require('./routes/cardRoutes');
const customerRoutes = require('./routes/customerRoutes');
const accountRoutes = require('./routes/accountRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const accountcardRoutes = require('./routes/accountcardRoutes');
const currencyRoutes = require('./routes/currencyRoutes');

const app = express();

// Middleware
app.use(helmet());
app.use(logger('dev'));
app.use(express.json());

// Rajoittaa yleisiä pyyntöjä 100 pyyntöön 60 sekunnissa IP-osoitetta kohden
const globalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later' }
});
app.use(globalLimiter);

// Routes
app.use('/api/cards', cardRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/accountcard', accountcardRoutes);
app.use('/api/currency', currencyRoutes);
app.use('/api/accountcards', accountcardRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

module.exports = app;

/*
API selitys in a nutshell:
- POST /api/cards/login: Kirjautuminen kortilla, tarvittee korttinumeron ja PIN koodin. Palauttaa JWT tokenin.
- POST /api/cards/logout: Uloskirjautuminen, vaatii JWT tokenin.
- GET /api/customers: Hakee asiakkaan tiedot, vaatii JWT tokenin.
- GET /api/accounts/:idaccount: Hakee tilin tiedot, vaatii JWT tokenin ja tilin ID:n.
- GET /api/transactions/:idaccount: Hakee tilitapahtumat, vaatii JWT tokenin ja tilin ID:n.
- POST /api/transactions/withdraw: Nostotapahtuma, vaatii JWT tokenin, tilin ID:n ja nostosumman.
- POST /api/transactions/deposit: Talletustapahtuma, vaatii JWT tokenin, tilin ID:n ja talletussumman.
- POST /api/transactions/transfer: Siirtotapahtuma, vaatii JWT tokenin, lähde- ja kohdetilin ID:t sekä siirtosumman.
- GET /api/currency/rates: Hakee valuuttakurssit, vaatii JWT tokenin.
- GET /api/currency/rate-change: Hakee valuuttakurssimuutokset verrattuna eiliseen, vaatii JWT tokenin.
*/