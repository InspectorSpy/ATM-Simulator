/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.15-MariaDB, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: bankatm
-- ------------------------------------------------------
-- Server version	10.11.15-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `account`
--

DROP TABLE IF EXISTS `account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `account` (
  `idaccount` int(11) NOT NULL AUTO_INCREMENT,
  `idcustomer` int(11) NOT NULL,
  `balance` decimal(10,2) DEFAULT 0.00,
  `creditlimit` decimal(10,2) DEFAULT 0.00,
  `accountnumber` varchar(20) DEFAULT NULL,
  `accounttype` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`idaccount`),
  UNIQUE KEY `accountnumber_UNIQUE` (`accountnumber`),
  KEY `fk_account_customer` (`idcustomer`),
  CONSTRAINT `fk_account_customer` FOREIGN KEY (`idcustomer`) REFERENCES `customer` (`idcustomer`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account`
--

LOCK TABLES `account` WRITE;
/*!40000 ALTER TABLE `account` DISABLE KEYS */;
INSERT INTO `account` VALUES
(1,1,1400.00,500.00,'FI1234567890123456','debit'),
(2,1,300.00,0.00,'FI9876543210654321','savings'),
(3,2,2400.00,1000.00,'FI1111222233334444','debit');
/*!40000 ALTER TABLE `account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `accountcard`
--

DROP TABLE IF EXISTS `accountcard`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `accountcard` (
  `idcard` int(11) NOT NULL,
  `idaccount` int(11) NOT NULL,
  PRIMARY KEY (`idcard`,`idaccount`),
  KEY `fk_accountcard_account` (`idaccount`),
  CONSTRAINT `fk_accountcard_account` FOREIGN KEY (`idaccount`) REFERENCES `account` (`idaccount`) ON UPDATE CASCADE,
  CONSTRAINT `fk_accountcard_card` FOREIGN KEY (`idcard`) REFERENCES `card` (`idcard`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accountcard`
--

LOCK TABLES `accountcard` WRITE;
/*!40000 ALTER TABLE `accountcard` DISABLE KEYS */;
INSERT INTO `accountcard` VALUES
(1,1),
(1,2),
(2,3);
/*!40000 ALTER TABLE `accountcard` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `card`
--

DROP TABLE IF EXISTS `card`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `card` (
  `idcard` int(11) NOT NULL AUTO_INCREMENT,
  `cardnumber` varchar(20) DEFAULT NULL,
  `pin` varchar(255) DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `failed_attempts` tinyint(4) NOT NULL DEFAULT 0,
  PRIMARY KEY (`idcard`),
  UNIQUE KEY `cardnumber_UNIQUE` (`cardnumber`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `card`
--

LOCK TABLES `card` WRITE;
/*!40000 ALTER TABLE `card` DISABLE KEYS */;
INSERT INTO `card` VALUES
(1,'06000641f3','$2b$10$/hNhvUaJ7sOWb8mG8k5RgO3AlvLMlmMtyX6VSXUxZLl0/s8RKxUX6',0,3),
(2,'060005fbdc','$2b$10$4.Lzp7wqXBFwEIi5yB3LGugsEzzbZ0NR83fhHmtn/PyWlbH2.fXAu',1,0);
/*!40000 ALTER TABLE `card` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer` (
  `idcustomer` int(11) NOT NULL AUTO_INCREMENT,
  `fname` varchar(45) DEFAULT NULL,
  `lname` varchar(45) DEFAULT NULL,
  `address` varchar(45) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`idcustomer`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer`
--

LOCK TABLES `customer` WRITE;
/*!40000 ALTER TABLE `customer` DISABLE KEYS */;
INSERT INTO `customer` VALUES
(1,'Matti','Meikäläinen','Kauppakatu 1, Oulu','0401234567'),
(2,'Maija','Virtanen','Hallituskatu 5, Oulu','0507654321');
/*!40000 ALTER TABLE `customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `idtransactions` int(11) NOT NULL AUTO_INCREMENT,
  `idaccount` int(11) NOT NULL,
  `transaction_datetime` timestamp NULL DEFAULT current_timestamp(),
  `transaction_type` varchar(45) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`idtransactions`),
  KEY `fk_transactions_account` (`idaccount`),
  CONSTRAINT `fk_transactions_account` FOREIGN KEY (`idaccount`) REFERENCES `account` (`idaccount`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
INSERT INTO `transactions` VALUES
(1,1,'2026-03-16 12:35:43','deposit',100.00),
(2,1,'2026-03-16 12:36:34','withdrawal',50.00),
(3,1,'2026-03-16 19:39:38','transfer_out',100.00),
(4,3,'2026-03-16 19:39:38','transfer_in',100.00),
(5,1,'2026-03-17 12:06:05','transfer_out',100.00),
(6,3,'2026-03-17 12:06:05','transfer_in',100.00),
(7,1,'2026-03-17 12:07:31','withdrawal',50.00),
(8,1,'2026-03-17 12:07:45','deposit',100.00);
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-20 12:46:13