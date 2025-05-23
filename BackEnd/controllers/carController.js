const Brands = require("../models/Brands");
const Car = require("../models/Car");
const User = require("../models/User");

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
      const brand = req.query.brand;
      const driveType = req.query.driveType;
      const bodyType = req.query.bodyType;

      const filter = {};

      if (brand) {
        filter.brand = brand;
      }

      if (req.query.price) {
        const [priceFrom, priceTo] = req.query.price.split("-").map(Number);
        filter.price = {};
        if (!isNaN(priceFrom)) filter.price.$gte = priceFrom;
        if (!isNaN(priceTo)) filter.price.$lte = priceTo;
      }

      if (driveType) {
        filter.driveType = driveType;
      }

      if (bodyType) {
        filter.bodyType = bodyType;
      }

      const cars = await Car.aggregate([
        { $match: filter },
        { $sample: { size: limit } },
        { $skip: skip },
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
        horsepower,
        country,
        driveType,
        bodyType,
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

      const userId = req.user.id;

      let newImages = [];
      if (req.files && req.files.length > 0) {
        req.files.forEach((file, index) => {
          newImages.push(file.path);
        });
      } else {
        return res.status(400).json({ message: "Нет загруженных изображений" });
      }

      const car = new Car({
        horsepower,
        country,
        driveType,
        bodyType,
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
        sellerId: userId,
      });

      await car.save();
      return res
        .status(200)
        .json({ message: "Автомобиль успешно добавлен", car });
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: "Ошибка добавления автомобиля" });
    }
  }

  async getCar(req, res) {
    try {
      const id = req.params.id;
      const car = await Car.findById(id);
      const seller = await User.findById(car.sellerId);
      res
        .status(200)
        .json({ message: "Успешно!", carData: car, sellerData: seller });
    } catch (err) {
      console.log(err);
      res.status(400).json({ message: "Ошибка получения автомобиля" });
    }
  }

  async editCar(req, res) {
    try {
      const id = req.params.id;

      const carCheck = await Car.findById(id);

      if (carCheck.sellerId !== req.user.id) {
        return res
          .status(400)
          .json({ message: "У вас нет прав для изменения этого автомобиля" });
      }

      const {
        horsepower,
        country,
        driveType,
        bodyType,
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

      const car = await Car.findByIdAndUpdate(
        { _id: id },
        {
          horsepower,
          country,
          driveType,
          bodyType,
          brand,
          model,
          year,
          engine,
          transmission,
          mileage,
          fuelType,
          color,
          price,
        }
      );

      res.status(200).json({ message: "Автомобиль изменен!", data: car });
    } catch (e) {
      res.status(500).json({ message: "Ошибка изменения" });
      console.log(e);
    }
  }

  async deleteCar(req, res) {
    try {
      const id = req.params.id;

      const carCheck = await Car.findById(id);

      if (carCheck.sellerId !== req.user.id) {
        return res
          .status(400)
          .json({ message: "У вас нет прав для удаления этого автомобиля" });
      }

      await Car.findByIdAndDelete({ _id: id });

      res.status(200).json({ message: "Автомобиль удален!" });
    } catch (e) {
      res.status(500).json({ message: "Ошибка удаления" });
      console.log(e);
    }
  }
}

module.exports = new CarController();
