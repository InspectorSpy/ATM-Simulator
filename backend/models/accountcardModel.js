// accountcardModel - hakee accountcard-taulun tietoja, lisää ja poistaa rivejä, hakee tilitiedot kortin numerolla ja tilityypillä
const db = require('./db');

// Hakee kaikki accountcard-taulun rivit
const getAll = async () => {
    const [rows] = await db.query('SELECT * FROM accountcard');
    return rows;
};

// Hakee accountcard-taulun rivit, joissa idcard vastaa annettua parametria
const getByCardId = async (idcard) => {
    const [rows] = await db.query(`SELECT * FROM accountcard WHERE idcard = ?`, [idcard]);
    return rows;
};

// Hakee accountcard-taulun rivit, joissa idaccount vastaa annettua parametria
const getByAccountId = async (idaccount) => {
    const [rows] = await db.query(`SELECT * FROM accountcard WHERE idaccount = ?`, [idaccount]);
    return rows;
};

// Lisää uuden rivin accountcard-tauluun
const createAccountCard = async (idaccount, idcard) => {
    const [result] = await db.query(
        `INSERT INTO accountcard (idaccount, idcard) VALUES (?, ?)`,
        [idaccount, idcard]
    );
    return result;
};

// Poistaa rivin accountcard-taulusta, jossa idaccount ja idcard vastaavat annettuja parametreja
const removeAccountCard = async (idaccount, idcard) => {
    const [result] = await db.query(
        `DELETE FROM accountcard WHERE idaccount = ? AND idcard = ?`,
        [idaccount, idcard]
    );
    return result;
};

// Hakee account- ja customer-taulujen tiedot, joissa cardnumber ja accounttype vastaavat annettuja parametreja
const getAccountTypeByCardNumber = async (accounttype, cardnumber) => {
    const [result] = await db.query(
        `SELECT a.idaccount, a.accountnumber, a.accounttype, a.balance, a.creditlimit, c.fname, c.lname
        FROM account a 
                INNER JOIN accountcard ON a.idaccount = accountcard.idaccount
        INNER JOIN card ON accountcard.idcard = card.idcard
        INNER JOIN customer c ON c.idcustomer = a.idcustomer
        WHERE card.cardnumber = ? AND a.accounttype = ?`,
        [cardnumber, accounttype]
    );
    return result[0];
}

module.exports = { getAll, getByCardId, getByAccountId, createAccountCard, removeAccountCard, getAccountTypeByCardNumber };
