const { Schema, model } = require('mongoose')

const Car = new Schema({
    name: { type: String, required: false },
    horsepower: { type: Number, required: false },
    country: { type: String, required: false },
    driveType: { type: String, required: false },
    bodyType: { type: String, required: false },
    driveType: { type: String, required: false },
    horsepower: { type: String, required: false },
    country: { type: String, required: false },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    engine: { type: String, required: true },
    transmission: { type: String, required: true },
    mileage: { type: Number, required: true },
    fuelType: { type: String, required: true },
    color: { type: String, required: true },
    price: { type: Number, required: true },
    images: { type: Array, required: true },
    sellerId: { type: String, required: true },
    registrationDate: { type: Date, default: Date.now },
})

module.exports = model("Cars", Car)