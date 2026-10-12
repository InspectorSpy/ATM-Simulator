// Currency controller - hakee valuuttakurssitiedot ja laskee kurssimuutokset
const currencyModel = require('../models/currencyModel');

// Get current exchange rates
const getRates = (req, res) => {
    currencyModel.getRates((err, data) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch rates' });
        res.json(data);
    });
};

// Get exchange rate changes compared to yesterday
const getRateChange = (req, res) => {
    currencyModel.getRates((err, today) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch rates' });

        currencyModel.getYesterdayRates((err, yesterday) => {
            if (err) return res.status(500).json({ error: 'Failed to fetch yesterday rates' });

            const change = {};
            for (const currency in today.rates) {
                const todayRate = today.rates[currency];
                const yesterdayRate = yesterday.rates[currency];
                const diff = todayRate - yesterdayRate;
                const pct = ((diff / yesterdayRate) * 100).toFixed(2);

                change[currency] = {
                    today: todayRate,
                    yesterday: yesterdayRate,
                    change: parseFloat(diff.toFixed(4)),
                    change_pct: parseFloat(pct),
                    direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'unchanged'
                };
            }

            res.json({
                base: 'EUR',
                date: today.date,
                previous_date: yesterday.date,
                rates: change
            });
        });
    });
};

module.exports = { getRates, getRateChange };