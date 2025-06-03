const { Schema, model } = require("mongoose");

const Review = new Schema({
  author: { type: Schema.ObjectId, ref: "Users", required: true },
  seller: { type: Schema.ObjectId, ref: "Users", required: true },
  car: { type: Schema.ObjectId, ref: "Cars", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true, maxlength: 1000 },
});

module.exports = model("Reviews", Review);
