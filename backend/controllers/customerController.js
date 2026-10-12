// Customer controller - hakee asiakastiedot, luo, päivittää ja poistaa asiakkaita
const customerModel = require('../models/customerModel');

// Get customer details
const getCustomerDetails = async (req, res) => {
    const idcard = req.user.idcard;
    if (!idcard) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const customer = await customerModel.getByCardId(idcard);
        if (!customer) return res.status(404).json({ error: 'Customer not found' });
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: 'server error' });
    }
};

// Get all customers
const getAllCustomers = async (req, res) => {
    try {
        const customers = await customerModel.getAll();
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Get customer by id
const getCustomerById = async (req, res) => {
    try {
        const customer = await customerModel.findById(req.params.id);
        if (!customer) return res.status(404).json({ error: 'Customer not found' });
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Create a new customer
const createCustomer = async (req, res) => {
    const { fname, lname, address, phone } = req.body;
    if (!fname || !lname) return res.status(400).json({ error: 'fname and lname are required' });

    try {
        const result = await customerModel.createCustomer(fname, lname, address, phone);
        res.status(201).json({ idcustomer: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Update customer details
const updateCustomer = async (req, res) => {
    const { fname, lname, address, phone } = req.body;
    try {
        await customerModel.updateCustomer(req.params.id, fname, lname, address, phone);
        res.json({ message: 'Customer updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete a customer
const deleteCustomer = async (req, res) => {
    try {
        await customerModel.deleteCustomer(req.params.idcustomer);
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { getCustomerDetails, getAllCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer };