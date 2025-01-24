import { Transaction } from "../../Models/transaction.models.js";

// Create a new transaction
export const createTransaction = async (req, res) => {
  try {
    const transaction = new Transaction(req.body);
    await transaction.save();
    res.status(201).json({
      message: "Transaction created successfully",
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating transaction",
      error: error.message,
    });
  }
};

// Get all transactions
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().populate(
      "userId",
      "name email"
    );
    res.status(200).json({
      message: "Transactions retrieved successfully",
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving transactions",
      error: error.message,
    });
  }
};

// Get a single transaction by ID
export const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate(
      "userId",
      "name email"
    );
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.status(200).json({
      message: "Transaction retrieved successfully",
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving transaction",
      error: error.message,
    });
  }
};

// Update a transaction by ID
export const updateTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.status(200).json({
      message: "Transaction updated successfully",
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating transaction",
      error: error.message,
    });
  }
};

// Delete a transaction by ID
export const deleteTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.status(200).json({
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting transaction",
      error: error.message,
    });
  }
};
