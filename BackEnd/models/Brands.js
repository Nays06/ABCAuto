const { Schema, model } = require('mongoose')

const Brands = new Schema({
    title: { type: String, required: true },
    img: { type: String, required: true },
})

module.exports = model("Brands", Brands)