const jwt = require("jsonwebtoken");
require('dotenv').config();
const secret = process.env.JWT_SECRET

module.exports = function (req, res, next) {
  if (req.method === "OPTIONS") {
    next();
  }

  try {
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(403).json({ message: "Пользователь не авторизован" });
    }
    const decodeDate = jwt.verify(token , secret)
    req.user = decodeDate
    next()
  } catch (e) {
    console.log(e);
    return res.status(403).json({message: "Нет доступа"})
  }
};
