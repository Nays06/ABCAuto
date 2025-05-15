const Brands = require("../models/Brands");
const Car = require("../models/Car");

class CarController {
  async getBrands(req, res) {
    try {
      const brands = await Brands.find();
      res.status(200).json(brands);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Ошибка на сервере" });
    }
  }

  async getCars(req, res) {
    try {
      const limit = req.query.limit || 12;
      const page = req.query.page || 1;
      const skip = (page - 1) * limit;
  
      const cars = await Car.aggregate([
        { $sample: { size: limit } },
        { $skip: skip }
      ]);
      
      res.status(200).json(cars);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Ошибка на сервере" });
    }
  }

  async addCar(req, res) {
    try {
      const {
        brand,
        model,
        year,
        engine,
        transmission,
        mileage,
        fuelType,
        color,
        price,
      } = req.body;

      const userId = req.user.id

      let newImages = [];
      if (req.files && req.files.length > 0) {
        req.files.forEach((file, index) => {
          newImages.push(file.path)
        });
      } else {
        return res.status(400).json({ message: "Нет загруженных изображений" });
      }

      const car = new Car({
        brand,
        model,
        year,
        engine,
        transmission,
        mileage,
        fuelType,
        color,
        price,
        images: newImages,
        sellerId: userId
      });

      await car.save()
      return res.status(200).json({ message: "Автомобиль успешно добавлен", car })
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: "Ошибка добавления автомобиля" });
    }
  }
}

module.exports = new CarController();
