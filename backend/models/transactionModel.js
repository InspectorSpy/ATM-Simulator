// transactionModel - sisältää tietokantakyselyt tapahtumatiedon hakemiseen, luomiseen, päivittämiseen ja poistamiseen
const db = require('./db');

// transaction model functions
const getByAccount = async (idaccount, limit, offset) => {
    const [rows] = await db.query(
        `SELECT idtransactions, transaction_type, amount, transaction_datetime
        FROM transactions
        WHERE idaccount = ?
        ORDER BY transaction_datetime DESC
        LIMIT ? OFFSET ?`,
        [idaccount, limit, offset]
    );
    return rows;
};

// Laskee tapahtumien kokonaismäärän tietylle tilille
const countByAccount = async (idaccount) => {
    const [[{ total }]] = await db.query(
        `SELECT COUNT(*) as total
        FROM transactions
        WHERE idaccount = ?`,
        [idaccount]
    );
    return total;
};

// Hakee transactions-taulun rivin, jossa idtransactions vastaa annettua parametria
const findById = async (idtransactions) => {
    const [rows] = await db.query(
        `SELECT * FROM  transactions WHERE idtransactions = ?`,
        [idtransactions]
    );
    return rows[0];
};

// Poistaa rivin transactions-taulusta, jossa idtransactions vastaa annettua parametria
const removeTransaction = async (idtransactions) => {
    const [result] = await db.query(
        `DELETE FROM transactions WHERE idtransactions = ?`,
        [idtransactions]
    );
    return result;
};

// Suorittaa nostotapahtuman tilille, tarkistaa riittävät varat ja kirjaa tapahtuman transactions-tauluun
const withdraw = async (idaccount, amount) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [accountRows] = await connection.query(
            `SELECT balance, accounttype, creditlimit FROM account WHERE idaccount = ? FOR UPDATE`,
            [idaccount]
        );
        const account = accountRows[0];
        if (!account) {
            await connection.rollback();
            return { status: 404, error: 'Account not found' };
        }
        const availableFunds = account.accounttype === 'credit'
            ? account.creditlimit + account.balance
            : account.balance;
        if (availableFunds < amount) {
            await connection.rollback();
            return { status: 400, error: 'Insufficient funds' };
        }
        await connection.query(
            `UPDATE account SET balance = balance - ? WHERE idaccount = ?`,
            [amount, idaccount]
        );
        await connection.query(
            `INSERT INTO transactions (idaccount, transaction_type, amount) VALUES (?, 'withdrawal', ?)`,
            [idaccount, amount]
        );
        await connection.commit();
        return { status: 200, message: 'Withdrawal successful', amount };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// Suorittaa talletustapahtuman tilille, kirjaa tapahtuman transactions-tauluun
const deposit = async (idaccount, amount) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [accountRows] = await connection.query(
            `SELECT idaccount FROM account WHERE idaccount = ?`,
            [idaccount]
        );
        const account = accountRows[0];
        if (!account) {
            await connection.rollback();
            return { status: 404, error: 'Account not found' };
        }
        await connection.query(
            `UPDATE account SET balance = balance + ? WHERE idaccount = ?`,
            [amount, idaccount]
        );
        await connection.query(
            `INSERT INTO transactions (idaccount, transaction_type, amount) VALUES (?, 'deposit', ?)`,
            [idaccount, amount]
        );
        await connection.commit();
        return { status: 200, message: 'Deposit successful', amount };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// Suorittaa rahansiirtotapahtuman tililtä toiselle, tarkistaa riittävät varat, päivittää molempien tilien saldot ja kirjaa tapahtuman transactions-tauluun
const transfer = async (idaccount, targetaccountnumber, amount) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Look up target account by account number
        const [targetLookup] = await connection.query(
            `SELECT idaccount FROM account WHERE accountnumber = ?`,
            [targetaccountnumber]
        );

        if (!targetLookup || targetLookup.length === 0) {
            await connection.rollback();
            return { status: 404, error: 'Target account not found' };
        }

        const targetaccount = targetLookup[0].idaccount;

        const [minId, maxId] = [idaccount, targetaccount].map(Number).sort((a, b) => a - b);
        await connection.query(
            `SELECT idaccount FROM account WHERE idaccount IN (?, ?) ORDER BY idaccount FOR UPDATE`,
            [minId, maxId]
        );

        const [sourceRows] = await connection.query(
            `SELECT balance, accounttype, creditlimit FROM account WHERE idaccount = ?`,
            [idaccount]
        );
        const sourceAccount = sourceRows[0];

        if (!sourceAccount) {
            await connection.rollback();
            return { status: 404, error: 'Source account not found' };
        }

        const availableFunds = sourceAccount.accounttype === 'credit'
            ? sourceAccount.creditlimit + sourceAccount.balance
            : sourceAccount.balance;

        if (availableFunds < amount) {
            await connection.rollback();
            return { status: 400, error: 'Insufficient funds' };
        }

        if (parseInt(idaccount) === parseInt(targetaccount)) {
            await connection.rollback();
            return { status: 400, error: 'Cannot transfer to the same account' };
        }

        await connection.query(
            `UPDATE account SET balance = balance - ? WHERE idaccount = ?`,
            [amount, idaccount]
        );

        await connection.query(
            `UPDATE account SET balance = balance + ? WHERE idaccount = ?`,
            [amount, targetaccount]
        );

        await connection.query(
            `INSERT INTO transactions (idaccount, transaction_type, amount) VALUES (?, 'transfer_out', ?), (?, 'transfer_in', ?)`,
            [idaccount, amount, targetaccount, amount]
        );

        await connection.commit();
        return { status: 200, message: 'Transfer successful', amount, targetaccountnumber };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

module.exports = { getByAccount, countByAccount, findById, removeTransaction, withdraw, deposit, transfer };