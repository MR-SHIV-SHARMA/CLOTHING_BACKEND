import Advertisement from "../../Models/advertisement.models.js";

// Create a new advertisement
export const createAdvertisement = async (req, res) => {
  try {
    const { imageUrl, description, displayDuration } = req.body;

    if (!imageUrl || !description || !displayDuration) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const advertisement = new Advertisement({ imageUrl, description, displayDuration });
    await advertisement.save();

    res.status(201).json({
      message: "Advertisement created successfully.",
      data: advertisement,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while creating the advertisement.",
      error: error.message,
    });
  }
};

// Retrieve all advertisements
export const getAllAdvertisements = async (req, res) => {
  try {
    const advertisements = await Advertisement.find().sort({ createdAt: -1 });
    res.status(200).json({
      message: "Advertisements retrieved successfully.",
      data: advertisements,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while retrieving advertisements.",
      error: error.message,
    });
  }
};

// Retrieve a single advertisement by ID
export const getAdvertisementById = async (req, res) => {
  try {
    const { id } = req.params;
    const advertisement = await Advertisement.findById(id);

    if (!advertisement) {
      return res.status(404).json({ message: "Advertisement not found." });
    }

    res.status(200).json({
      message: "Advertisement retrieved successfully.",
      data: advertisement,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while retrieving the advertisement.",
      error: error.message,
    });
  }
};

// Update an advertisement by ID
export const updateAdvertisementById = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const advertisement = await Advertisement.findByIdAndUpdate(id, updates, { new: true });

    if (!advertisement) {
      return res.status(404).json({ message: "Advertisement not found." });
    }

    res.status(200).json({
      message: "Advertisement updated successfully.",
      data: advertisement,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while updating the advertisement.",
      error: error.message,
    });
  }
};

// Delete an advertisement by ID
export const deleteAdvertisementById = async (req, res) => {
  try {
    const { id } = req.params;

    const advertisement = await Advertisement.findByIdAndDelete(id);

    if (!advertisement) {
      return res.status(404).json({ message: "Advertisement not found." });
    }

    res.status(200).json({ message: "Advertisement deleted successfully." });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while deleting the advertisement.",
      error: error.message,
    });
  }
};
