const User = require("../models/User");
const Car = require("../models/Car");

class favoriteController {
  async getUserFavorites(req, res) {
    const userId = req.user.id;

    const user = await User.findById(userId);

    if(!user) {
      return res.status(401).json({ message: "Пользователя с таким ID не существует", isNotExists: true })
    }

    res.status(200).json({ message: "Успешно", favorites: user.favorites });
  }

  async addToFavorites(req, res) {
    try {
      const userId = req.user.id;
      const { carId } = req.body;

    await User.findByIdAndUpdate(userId, {
      $push: {
        favorites: { carId, createdAt: new Date() }
      }
    });

      res.status(200).json({ message: "Машина была успешно добавлена в избранное" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  }

  async removeFromFavorites(req, res) {
    try {
      const userId = req.user.id;
      const carId = req.params.id;

      await User.updateOne({ _id: userId }, { $pull: { favorites: { carId } } });

      res
        .status(200)
        .json({ message: "Машина была успешно удалена из избранного" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  }

  async getUserFavoriteCars(req, res) {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .select('favorites')
      .lean();

    const favoriteCarIds = user.favorites
      .sort((a, b) => b.createdAt - a.createdAt)
      .map(fav => fav.carId);

    const favoriteCars = await Car.find({
      _id: { $in: favoriteCarIds }
    }).lean();

    const carsById = {};
    favoriteCars.forEach(car => { carsById[car._id] = car; });

    const sortedCars = favoriteCarIds.map(id => carsById[id]);

    res.status(200).json(sortedCars);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  }
}

module.exports = new favoriteController();
