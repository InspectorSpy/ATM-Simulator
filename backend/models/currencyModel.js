// currencyModel - hakee valuuttakurssitiedot ulkoisesta Frankfurter API:sta ja laskee kurssimuutokset
const https = require('https');

// Hakee nykyiset valuuttakurssit API:sta
const getRates = (callback) => {
    const url = 'https://api.frankfurter.dev/v1/latest?from=EUR&to=USD,GBP,SEK,NOK';

    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                callback(null, JSON.parse(data));
            } catch (err) {
                callback(err);
            }
        });
    }).on('error', callback);
};

// Hakee eiliset valuuttakurssit API:sta ja laskee muutokset nykyisiin kursseihin
const getYesterdayRates = (callback) => {
    const today = new Date();
    today.setDate(today.getDate() - 1);
    const yesterday = today.toISOString().split('T')[0];
    const url = `https://api.frankfurter.dev/v1/${yesterday}?from=EUR&to=USD,GBP,SEK,NOK`;

    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                callback(null, JSON.parse(data));
            } catch (err) {
                callback(err);
            }
        });
    }).on('error', callback);
};

module.exports = { getRates, getYesterdayRates };