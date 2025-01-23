import Feedback from "../../Models/feedback.models.js";

const createFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.create(req.body);
    res.status(201).json(feedback);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({});
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateFeedback = async (req, res) => {
  try {
    const updatedFeedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedFeedback);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteFeedback = async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.status(204).json({ message: "Feedback deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { createFeedback, getAllFeedbacks, updateFeedback, deleteFeedback };
