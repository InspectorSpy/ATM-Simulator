// accountModel - hakee account-taulun tietoja, lisää, päivittää ja poistaa rivejä, hakee tilitiedot kortin numerolla
const db = require('./db');

// Hakee account-taulun rivin, jossa idaccount vastaa annettua parametria
const findById = async (idaccount) => {
    const [rows] = await db.query(
        `SELECT a.idaccount, a.accountnumber, a.accounttype, a.balance, a.creditlimit, c.fname, c.lname
        FROM account a
        JOIN customer c ON a.idcustomer = c.idcustomer
        WHERE a.idaccount = ?`,
    [idaccount]
    );
    return rows[0];
};

// Hakee kaikki account-taulun rivit
const getAll = async () => {
    const [rows] = await db.query(`SELECT * FROM account`);
    return rows;
};

// Hakee account-taulun rivit, joissa idcard vastaa annettua parametria
const getByCardId = async (idcard) => {
    const [rows] = await db.query(
        `SELECT a.idaccount, a.accountnumber, a.accounttype
        FROM account a
        JOIN accountcard ac ON a.idaccount = ac.idaccount
        WHERE ac.idcard = ?`,
        [idcard]
    );
    return rows;
};

// Luo uuden rivin account-tauluun
const createAccount = async (idcustomer, balance, creditlimit, accountnumber, accounttype) => {
    const [result] = await db.query(
        `INSERT INTO account (idcustomer, balance, creditlimit, accountnumber, accounttype) VALUES (?, ?, ?, ?, ?)`,
        [idcustomer, balance, creditlimit, accountnumber, accounttype]
    );
    return result;
};

// Päivittää account-taulun rivin, jossa idaccount vastaa annettua parametria
const updateAccount = async (idaccount, balance, creditlimit, accountnumber, accounttype) => {
    const [result] = await db.query(
        `UPDATE account SET balance = ?, creditlimit = ?, accountnumber = ?, accounttype = ? WHERE idaccount = ?`,
        [balance, creditlimit, accountnumber, accounttype, idaccount]
    );
    return result;
};

// Poistaa rivin account-talusta, jossa idaccount vastaa annettua parametria
const removeAccount = async (idaccount) => {
    const [result] = await db.query(`DELETE FROM account WHERE idaccount = ?`, [idaccount]);
    return result;
};

module.exports = { findById, getAll, getByCardId, createAccount, updateAccount, removeAccount };