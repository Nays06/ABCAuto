const jwt = require("jsonwebtoken");
require("dotenv").config();
const secret = process.env.JWT_SECRET;

module.exports = function (req, res, next) {
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(403).json({ message: "Пользователь не авторизован" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(403).json({ message: "Токен не предоставлен" });
    }

    const decodedData = jwt.verify(token, secret);
    req.user = decodedData;
    next();
  } catch (e) {
    if (e.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Неверный токен" });
    } else if (e.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Токен истёк" });
    } else {
      return res
        .status(500)
        .json({ message: "Ошибка сервера при проверке токена" });
    }
  }
};
