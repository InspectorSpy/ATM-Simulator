// customerModel - sisältää tietokantakyselyt asiakastiedon hakemiseen, luomiseen, päivittämiseen ja poistamiseen
const db = require('./db');

// Hakee customer-taulun rivin, jossa idcard vastaa annettua parametria
const getByCardId = async (idcard) => {
    const [rows] = await db.query(
        `SELECT DISTINCT c.idcustomer, c.fname, c.lname, c.phone
        FROM customer c
        JOIN account a ON c.idcustomer = a.idcustomer
        JOIN accountcard ac ON a.idaccount = ac.idaccount
        WHERE ac.idcard = ?
        LIMIT 1`,
        [idcard]
    );
    return rows[0];
};

// Hakee customer-taulun rivin, jossa idcustomer vastaa annettua parametria
const findById = async (idcustomer) => {
    const [rows] = await db.query(`SELECT * FROM customer WHERE idcustomer = ?`, [idcustomer]);
    return rows[0];
};

// Hakee kaikki customer-taulun rivit
const getAll = async () => {
    const [rows] = await db.query(`SELECT * FROM customer`);
    return rows;
};

// Luo uuden rivin customer-tauluun
const createCustomer = async (fname, lname, address, phone) => {
    const [result] = await db.query(
        `INSERT INTO customer (fname, lname, address, phone) VALUES (?, ?, ?, ?)`,
        [fname, lname, address, phone]
    );
    return result;
};

// Päivittää customer-taulun rivin, jossa idcustomer vastaa annettua parametria
const updateCustomer = async (idcustomer, fname, lname, address, phone) => {
    const [result] = await db.query(
        `UPDATE customer SET fname = ?, lname = ?, address = ?, phone = ? WHERE idcustomer = ?`,
        [fname, lname, address, phone, idcustomer]
    );
    return result;
};

// Poistaa rivin customer-taulusta, jossa idcustomer vastaa annettua parametria
const removeCustomer = async (idcustomer) => {
    const [result] = await db.query(`DELETE FROM customer WHERE idcustomer = ?`, [idcustomer]);
    return result;
};

module.exports = { getByCardId, findById, getAll, createCustomer, updateCustomer, removeCustomer };