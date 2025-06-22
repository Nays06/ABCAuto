const { Schema, model } = require("mongoose");

const Posts = new Schema({
  title: { type: String, required: true },
  text: { type: String, required: true },
  img: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = model("Posts", Posts);
