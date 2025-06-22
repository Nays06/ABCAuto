const Brands = require("../models/Brands");
const Car = require("../models/Car");
const User = require("../models/User");
const Sale = require("../models/Sale");
const Review = require("../models/Review");
const mongoose = require("mongoose");

const COMPILATION_BODY_TYPES = {
  family: ["SUV", "Crossover", "Van", "Wagon"],
  city: ["Hatchback", "Sedan", "Convertible", "Small crossover"],
  journey: ["SUV", "Crossover", "Pickup"],
};

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
      const limit = Number(req.query.limit) || 12;
      const page = Number(req.query.page) || 1;
      const skip = (page - 1) * limit;
      const { brand, model, driveType, bodyType, fuelType, price, yearFrom, yearTo, compilation, available } = req.query;

      const filter = {};

      if(available === "true") {
        filter.available = true
      }

      if (bodyType) filter.bodyType = bodyType;

      if (compilation && COMPILATION_BODY_TYPES[compilation]) {
        filter.bodyType = { $in: COMPILATION_BODY_TYPES[compilation] };
      }

      if (brand) filter.brand = brand;
      if (model) filter.model = model;
      if (driveType) filter.driveType = driveType;
      if (fuelType) filter.fuelType = fuelType;

      if (price) {
        const [min, max] = price.split("-").map(Number);
        filter.price = {};
        if (!isNaN(min)) filter.price.$gte = min;
        if (!isNaN(max)) filter.price.$lte = max;
      }

      if (yearFrom || yearTo) {
        filter.year = {};
        if (yearFrom && !isNaN(Number(yearFrom))) filter.year.$gte = Number(yearFrom);
        if (yearTo && !isNaN(Number(yearTo))) filter.year.$lte = Number(yearTo);
      }

      const cars = await Car.aggregate([
        { $match: filter },
        { $skip: skip },
        { $limit: limit },
      ]);

      res.status(200).json(cars);
    } catch (error) {
      console.error(error);
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
        description,
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
        description,
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
      let sale;
      if (!car.available) {
        sale = await Sale.findOne({ carId: car._id });
      }

      const haveReview = await Review.findOne({ car: car._id })

      res.status(200).json({
        message: "Успешно!",
        carData: car,
        sellerData: seller,
        saleInfo: sale,
        haveReview: !!haveReview
      });
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
        description
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
          description
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

  async buyCar(req, res) {
    try {
      const { id } = req.body;
      const userId = req.user.id;

      if (!id) {
        return res.status(400).json({ message: "Не указан ID автомобиля" });
      }

      const [car, user] = await Promise.all([
        Car.findById(id),
        User.findById(userId),
      ]);

      if (!car) {
        return res.status(404).json({ message: "Автомобиль не найден" });
      }
      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }

      if (!car.available) {
        return res.status(409).json({ message: "Этот автомобиль уже продан" });
      }

      if (user.balance < car.price) {
        return res
          .status(403)
          .json({ message: "На балансе недостаточно средств" });
      }

      if (car.sellerId.toString() === userId.toString()) {
        return res
          .status(400)
          .json({ message: "Нельзя купить собственный автомобиль" });
      }

      const updatedBuyer = await User.findByIdAndUpdate(
        userId,
        { $inc: { balance: -car.price } },
        { new: true }
      );

      await User.findByIdAndUpdate(car.sellerId, {
        $inc: { balance: car.price },
      });

      await Car.findByIdAndUpdate(id, { available: false });

      const sale = new Sale({
        buyerId: userId,
        sellerId: car.sellerId,
        carId: car._id,
        price: car.price,
      });

      await sale.save();

      res.status(200).json({
        message: "Покупка совершена успешно",
        newBalance: updatedBuyer.balance,
        saleInfo: sale,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Ошибка покупки машины" });
    }
  }
}

module.exports = new CarController();
