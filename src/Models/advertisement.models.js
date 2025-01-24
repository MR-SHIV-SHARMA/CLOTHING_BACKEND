import mongoose from "mongoose";

const advertisementSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  displayDuration: {
    type: Number,
    required: true,
    min: [1, "Display duration must be at least 1 second."],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Advertisement = mongoose.model("Advertisement", advertisementSchema);
export default Advertisement;