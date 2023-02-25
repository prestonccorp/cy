const mongoose = require("mongoose");

const ratingSchema = mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  n: {
    type: String,
    required: true,
  },
  des: {
    type: String,
    required: true,
  },
});

module.exports = ratingSchema;
