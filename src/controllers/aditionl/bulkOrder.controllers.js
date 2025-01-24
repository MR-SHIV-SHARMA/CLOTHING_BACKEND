import { BulkOrder } from "../../Models/bulkOrder.models.js";

// Create a new bulk order
const createBulkOrder = async (req, res) => {
  try {
    const bulkOrder = new BulkOrder(req.body);
    await bulkOrder.save();
    res
      .status(201)
      .json({ message: "Bulk order created successfully", data: bulkOrder });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating bulk order", error: error.message });
  }
};

// Get all bulk orders
const getAllBulkOrders = async (req, res) => {
  try {
    const bulkOrders = await BulkOrder.find();
    res.status(200).json({
      message: "Bulk orders retrieved successfully",
      data: bulkOrders,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving bulk orders", error: error.message });
  }
};

// Get a single bulk order by ID
const getBulkOrderById = async (req, res) => {
  try {
    const bulkOrder = await BulkOrder.findById(req.params.id);
    if (!bulkOrder) {
      return res.status(404).json({ message: "Bulk order not found" });
    }
    res
      .status(200)
      .json({ message: "Bulk order retrieved successfully", data: bulkOrder });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving bulk order", error: error.message });
  }
};

// Update a bulk order by ID
const updateBulkOrderById = async (req, res) => {
  try {
    const bulkOrder = await BulkOrder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!bulkOrder) {
      return res.status(404).json({ message: "Bulk order not found" });
    }
    res
      .status(200)
      .json({ message: "Bulk order updated successfully", data: bulkOrder });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating bulk order", error: error.message });
  }
};

// Delete a bulk order by ID
const deleteBulkOrderById = async (req, res) => {
  try {
    const bulkOrder = await BulkOrder.findByIdAndDelete(req.params.id);
    if (!bulkOrder) {
      return res.status(404).json({ message: "Bulk order not found" });
    }
    res.status(200).json({ message: "Bulk order deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting bulk order", error: error.message });
  }
};

export {
  createBulkOrder,
  getAllBulkOrders,
  getBulkOrderById,
  updateBulkOrderById,
  deleteBulkOrderById,
};
