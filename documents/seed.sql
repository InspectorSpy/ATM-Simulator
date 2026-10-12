-- Seed data
-- Run AFTER importing the schema dump

USE bankatm;

-- Customers
INSERT INTO `customer` (`fname`, `lname`, `address`, `phone`) VALUES
('Matti', 'Meikäläinen', 'Kauppakatu 1, Oulu', '0401234567'),
('Maija', 'Virtanen', 'Hallituskatu 5, Oulu', '0507654321');

-- Cards
INSERT INTO `card` (`cardnumber`, `pin`, `active`) VALUES
('4111111111111111', '$2b$10$/hNhvUaJ7sOWb8mG8k5RgO3AlvLMlmMtyX6VSXUxZLl0/s8RKxUX6', 1),
('4222222222222222', '$2b$10$4.Lzp7wqXBFwEIi5yB3LGugsEzzbZ0NR83fhHmtn/PyWlbH2.fXAu', 1);

-- Accounts
INSERT INTO `account` (`idcustomer`, `balance`, `creditlimit`, `accountnumber`, `accounttype`) VALUES
(1, 1500.00, 500.00, 'FI1234567890123456', 'debit'),    -- Matti debit
(1, 300.00, 0.00, 'FI9876543210654321', 'savings'),  -- Matti savings
(2, 2200.00, 1000.00, 'FI1111222233334444', 'debit');    -- Maija debit

-- Link cards to accounts (idaccount, idcard)
INSERT INTO `accountcard` (`idaccount`, `idcard`) VALUES
(1, 1),  -- Matti debit   -> Card 1
(2, 1),  -- Matti savings -> Card 1
(3, 2);  -- Maija debit   -> Card 2

-- Transaction history
INSERT INTO `transactions` (`idaccount`, `transaction_type`, `amount`) VALUES
(1, 'deposit',    1000.00),
(1, 'withdrawal',  200.00),
(1, 'deposit',     700.00),
(3, 'deposit',    2200.00),
(3, 'withdrawal',  500.00);