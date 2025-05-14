const User = require("../models/User");
const Role = require("../models/UserRole");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const secret = process.env.JWT_SECRET;
const fs = require("fs");
const Car = require("../models/Car");

const generateAccessToken = (id) => {
  const payload = {
    id,
  };
  return jwt.sign(payload, secret, { expiresIn: "24h" });
};

class authController {
  async registration(req, res) {
    try {
      const { name, surname, email, password } = req.body;
      const candidate = await User.findOne({ email });

      if (candidate) {
        if (req.file) {
          fs.unlink(req.file.path, (err) => {
            if (err) console.error("Error deleting file:", err);
          });
        }

        return res
          .status(400)
          .json({ message: "Пользователь с такой почтой уже существует" });
      }
      const hashPassword = bcrypt.hashSync(password, 8);
      const userRole = await Role.findOne({ value: "USER" });

      const user = new User({
        name,
        surname,
        email,
        password: hashPassword,
        roles: [userRole.value],
      });

      if (req.file) {
        user.avatar = req.file.path;
      } else {
        user.avatar = "static/default-avatar.jpeg";
      }

      await user.save();

      const token = generateAccessToken(user._id.toString());

      return res
        .status(200)
        .json({ message: "Регистрация прошла успешно", token });
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: "Ошибка регистрации" });

      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Неправильная почта!" });
      }

      const validPassword = bcrypt.compareSync(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: "Непарвильный пароль" });
      }

      const token = generateAccessToken(user._id);

      return res.status(200).json({ message: "Вы успешно вошли!", token });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Ошибка входа" });
    }
  }

  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      const adsCount = await Car.find({ sellerId: user._id }).countDocuments();
      const ads = await Car.find({ sellerId: user._id }).sort({ _id: -1 }).limit(12)

      if (user) {
        res
          .status(200)
          .json({
            message: "Успешно!",
            data: {
              name: user.name,
              surname: user.surname,
              email: user.email,
              avatar: user.avatar,
              registrationDate: user.registrationDate,
              adsCount,
              ads,
              reviewsCount: user.reviews.length,
            },
          });
      } else {
        res.status(400).json({ message: "Пользователь не найден!" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Ошибка данных профиля" });
    }
  }

  async getAvatar(req, res) {
    try {
      const user = await User.findById(req.user.id);

      if (user) {
        res
          .status(200)
          .json({
            message: "Успешно!",
            avatar: user.avatar,
          });
      } else {
        res.status(400).json({ message: "Пользователь не найден!" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Ошибка данных профиля" });
    }
  }
}

module.exports = new authController();
