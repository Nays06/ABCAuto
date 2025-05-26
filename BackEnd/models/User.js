const { Schema, model } = require('mongoose')

const User = new Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String },
    roles: [{ type: String, ref: "Role" }],
    registrationDate: { type: Date, default: Date.now },
    reviews: { type: Array, default: [] },
    favorites: [{
        carId: { type: String },
        createdAt: { type: Date, default: Date.now }
    }],
    isOnline: { type: Boolean },
    lastSeen: { type: Date },
    refreshToken: { type: String },
})

module.exports = model("Users", User)