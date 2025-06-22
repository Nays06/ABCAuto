const User = require("../models/User");
const Role = require("../models/UserRole");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const Car = require("../models/Car");
const Review = require("../models/Review");
require("dotenv").config();
const secret = process.env.JWT_SECRET;
const mailer = require("../nodemailer");

const generateAccessToken = (id) => {
  const payload = {
    id,
  };
  return jwt.sign(payload, secret, { expiresIn: "15m" });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
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
        user.avatar = "static/avatar/default-avatar.jpeg";
      }

      const message = {
        to: email,
        subject: "Подтверждение электронной почты",
        text: `Поздравляем вы успешно зарегистрировались на нашем сайте
        данные вашей учетной записи
        login: ${email} , 
        password: ${password}`,
      };
      mailer(message);

      const token = generateAccessToken(user._id.toString());
      const refreshToken = generateRefreshToken(user._id);

      user.refreshToken = refreshToken;
      await user.save();

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });

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

      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      user.refreshToken = refreshToken;
      await user.save();

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });
      return res
        .status(200)
        .json({ message: "Вы успешно вошли!", token: accessToken });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Ошибка входа" });
    }
  }

  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(401).json({
          message: "Пользователя с таким ID не существует",
          isNotExists: true,
        });
      }

      const adsCount = await Car.find({ sellerId: user._id }).countDocuments();
      const ads = await Car.find({ sellerId: user._id })
        .sort({ _id: -1 })
        .limit(12);

      const reviews = await Review.find({ seller: user._id });
      const reviewsCount = reviews.length;

      let averageRating = 0;
      if (reviewsCount > 0) {
        const totalRating = reviews.reduce((sum, review) => {
          return sum + (review.rating || 0);
        }, 0);
        averageRating = parseFloat((totalRating / reviewsCount).toFixed(1));
      }

      res.status(200).json({
        message: "Успешно!",
        data: {
          name: user.name,
          surname: user.surname,
          email: user.email,
          avatar: user.avatar,
          registrationDate: user.registrationDate,
          adsCount,
          ads,
          reviewsCount,
          reviews,
          rating: averageRating,
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Ошибка данных профиля" });
    }
  }

  async getProfileToId(req, res) {
    try {
      if (req.params?.id?.toString().length < 24) {
        return res
          .status(401)
          .json({ message: "Неверный ID", isNotExists: true });
      }
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(401).json({
          message: "Такого пользователя не существует",
          isNotExists: true,
        });
      }
      const adsCount = await Car.find({ sellerId: user._id }).countDocuments();
      const ads = await Car.find({ sellerId: user._id })
        .sort({ _id: -1 })
        .limit(12);

      const reviews = await Review.find({ seller: user._id });
      const reviewsCount = reviews.length;

      let averageRating = 0;
      if (reviewsCount > 0) {
        const totalRating = reviews.reduce((sum, review) => {
          return sum + (review.rating || 0);
        }, 0);
        averageRating = parseFloat((totalRating / reviewsCount).toFixed(1));
      }

      if (user) {
        res.status(200).json({
          message: "Успешно!",
          data: {
            name: user.name,
            surname: user.surname,
            email: user.email,
            avatar: user.avatar,
            registrationDate: user.registrationDate,
            adsCount,
            ads,
            reviewsCount,
            reviews,
            rating: averageRating,
          },
        });
      } else {
        res.status(400).json({ message: "Пользователь не найден!" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Ошибка данных профиля по id" });
    }
  }

  async getAvatar(req, res) {
    try {
      const user = await User.findById(req.user.id);

      if (user) {
        res.status(200).json({
          message: "Успешно!",
          avatar: user.avatar,
        });
      } else {
        res.status(400).json({ message: "Пользователь не найден!" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Ошибка вывода данных профиля" });
    }
  }

  async getID(req, res) {
    try {
      const id = req.user.id;
      const user = await User.findById(id);
      const isNotExists = !user;
      res.status(200).json({ message: "Успешно", id, isNotExists });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Ошибка вывода id" });
    }
  }

  async refresh(req, res) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token отсутствует" });
    }

    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      const user = await User.findById(decoded.id);

      if (!user || user.refreshToken !== refreshToken) {
        return res.status(401).json({ message: "Невалидный refresh token" });
      }

      const accessToken = generateAccessToken(user._id);
      return res.json({ accessToken });
    } catch (e) {
      return res.status(401).json({ message: "Невалидный refresh token" });
    }
  }

  async logout(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(400).json({ message: "Refresh token отсутствует" });
      }

      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(400).json({ message: "Пользователь не найден" });
      }

      user.refreshToken = null;
      await user.save();

      res.clearCookie("refreshToken");

      return res.json({ message: "Вы успешно вышли" });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Ошибка при выходе" });
    }
  }

  async getBalance(req, res) {
    try {
      const user = await User.findById(req.user.id);

      return res.status(200).json(user.balance);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Ошибка вывода баланса" });
    }
  }

  async setBalance(req, res) {
    try {
      const { balance } = req.body;

      await User.findByIdAndUpdate(req.user.id, {
        balance,
      });

      return res.status(200).json({ message: "Баланс успешно изменен" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Error balance editing" });
    }
  }
}

module.exports = new authController();
