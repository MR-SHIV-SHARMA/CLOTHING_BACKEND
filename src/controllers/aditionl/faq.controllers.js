import Faq from "../../Models/faq.models.js";

const getAllFaqs = async (req, res) => {
  try {
    const faqs = await Faq.find({});
    res.status(200).json(faqs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createFaq = async (req, res) => {
  try {
    const faq = await Faq.create(req.body);
    res.status(201).json(faq);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateFaq = async (req, res) => {
  try {
    const updatedFaq = await Faq.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(updatedFaq);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteFaq = async (req, res) => {
  try {
    await Faq.findByIdAndDelete(req.params.id);
    res.status(204).json({ message: "Faq deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getAllFaqs, createFaq, updateFaq, deleteFaq };
