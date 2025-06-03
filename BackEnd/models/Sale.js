const { Schema, model } = require('mongoose')

const Sales = new Schema({
    buyerId: { type: Schema.ObjectId, required: true },
    sellerId: { type: Schema.ObjectId, required: true },
    carId: { type: Schema.ObjectId, required: true },
    price: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    status: { type: String, default: "completed" }
})

module.exports = model("Sales", Sales)