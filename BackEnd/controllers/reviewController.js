const Review = require("../models/Review");

class reviewController {
  async addReview(req, res) {
    try {
      const userId = req.user.id;
      const { seller, car, rating, comment } = req.body;

      const existsReview = await Review.findOne({ author: userId, seller, car })

      if(existsReview) {
        return res.status(400).json({ message: "Вы уже оставляли отзыв об этом автомобиле" })
      }

      const review = new Review({
        author: userId,
        seller,
        car,
        rating,
        comment,
      });

      review.save()

      return res.status(200).json({ message: "Отзыв успешно добавлен", review })
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  }
}

module.exports = new reviewController();
