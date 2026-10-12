// cardModel - hakee card-taulun tietoja, lisää, päivittää ja poistaa rivejä, hakee korttitiedot kortin numerolla ja id:llä, päivittää epäonnistuneet yritykset ja lukitsee kortin
const db = require('./db');

// Hakee card-taulun rivin, jossa cardnumber vastaa annettua parametria
const findByCardNumber = async (cardnumber) => {
    const [rows] = await db.query('SELECT * FROM card WHERE cardnumber = ?', [cardnumber]);
    return rows[0];
};

// Hakee card-taulun rivin, jossa idcard vastaa annettua parametria
const findById = async (idcard) => {
    const [rows] = await db.query('SELECT * FROM card WHERE idcard = ?', [idcard]);
    return rows[0];
};

// Hakee kaikki card-taulun rivit
const getAll = async () => {
    const [rows] = await db.query('SELECT idcard, cardnumber, active, failed_attempts FROM card');
    return rows;
};

// Luo uuden rivin card-tauluun
const createCard = async (cardnumber, pinHash) => {
    const [result] = await db.query(
        `INSERT INTO card (cardnumber, pin, active, failed_attempts) VALUES (?, ?, 1, 0)`,
        [cardnumber, pinHash]
    );
    return result;
};

// Päivittää card-taulun rivin, jossa idcard vastaa annettua parametria
const updateCardStatus = async (idcard, cardnumber, active) => {
    const [result] = await db.query(
        `UPDATE card SET cardnumber = ?, active = ? WHERE idcard = ?`,
        [cardnumber, active, idcard]
    );
    return result;
};

// Poistaa rivin card-taulusta, jossa idcard vastaa annettua parametria
const removeCard = async (idcard) => {
    const [result] = await db.query(`DELETE FROM card WHERE idcard = ?`, [idcard]);
    return result;
};

// Päivittää card-taulun rivin, jossa idcard vastaa annettua parametria, asettaa failed_attempts-sarakkeen arvoon attempts
const updateFailedAttempts = async (idcard, attempts) => {
    const [result] = await db.query(
        `UPDATE card SET failed_attempts = ? WHERE idcard = ?`,
        [attempts, idcard]
    );
    return result;
};

// Lukitsee kortin asettamalla active-sarakkeen arvoon 0 ja failed_attempts-sarakkeen arvoon attempts, jossa idcard vastaa annettua parametria
const lockCard = async (idcard, attempts) => {
    const [result] = await db.query(
        `UPDATE card SET failed_attempts = ?, active = 0 WHERE idcard = ?`,
        [attempts, idcard]
    );
    return result;
};

// Nollaa failed_attempts-sarakkeen arvon 0, jossa idcard vastaa annettua parametria
const resetFailedAttempts = async (idcard) => {
    const [result] = await db.query(
        `UPDATE card SET failed_attempts = 0 WHERE idcard = ?`,
        [idcard]
    );
    return result;
};

module.exports = {
    findByCardNumber, findById, getAll, createCard, updateCardStatus, removeCard, updateFailedAttempts, lockCard, resetFailedAttempts
};