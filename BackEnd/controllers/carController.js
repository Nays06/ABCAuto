const Brands = require("../models/Brands");
const Car = require("../models/Car");

class CarController {
    async getBrands(req, res) {
        try {
            const brands = await Brands.find()
            res.status(200).json(brands)
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Ошибка на сервере" })
        }
    }

    async getCars(req, res) {
        try {
            const limit = req.query.limit || 10
            const page = req.query.page || 1
            const skip = (page - 1) * limit
            
            const cars = await Car.find().limit(limit).skip(skip)
            res.status(200).json(cars)
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Ошибка на сервере" })
        }
    }
}

module.exports = new CarController()