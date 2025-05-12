const { Schema, model } = require('mongoose')

const Car = new Schema({
    name: { type: String },
    horsepower: { type: Number },
    country: { type: String },
    driveType: { type: String },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    country: { type: String, required: true },
    year: { type: Number, required: true },
    engine: { type: String, required: true },
    transmission: { type: String, required: true },
    mileage: { type: Number, required: true },
    fuelType: { type: String, required: true },
    bodyType: { type: String, required: true },
    driveType: { type: String, required: true },
    horsepower: { type: String, required: true },
    color: { type: String, required: true },
    price: { type: Number, required: true },
    images: { type: Array, required: true },
})

module.exports = model("Cars", Car)