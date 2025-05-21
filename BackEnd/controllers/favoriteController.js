const User = require("../models/User");

class favoriteController {
    async getUserFavorites(req, res) {
        const userId = req.user.id;

        const user = await User.findById(userId)

        res.status(200).json({ message: "Успешно", favorites: user.favorites })
    }

  async addToFavorites(req, res) {
    try {
      const userId = req.user.id;
      const { carId } = req.body;

      await User.updateOne( { _id: userId }, { $addToSet: { favorites: carId } }
      );

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

      await User.updateOne({ _id: userId },{ $pull: { favorites: carId } });
      
      res.status(200).json({ message: "Машина была успешно удалена из избранного" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  }
}

module.exports = new favoriteController();
