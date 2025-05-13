const User = require("../models/User");
const Role = require("../models/UserRole")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
const secret = require(process.env.jwtSecret)

const generateAccessToken = (id) => {
    console.log(secret);
    
    const payload = {
      id
    };
    return jwt.sign(payload, secret, { expiresIn: "24h" });
  };

class authController {
  async reqistration(req, res) {
    try {
      const { name, surname, email, password } = req.body;
      const candidate = await User.findOne({ email });

      if (candidate) {
        return res
          .status(400)
          .json({ message: "Пользователь с такой почтой уже существует" });
      }
      const hashPassword = bcrypt.hashSync(password, 8);
      const userRole = await Role.findOne({ value: "USER"});

      const user = new User({
        name,
        surname,
        email,
        password: hashPassword,
        roles: [userRole.value]
      });

      if (req.file) {
        user.avatar = req.file.path;
      } else {
        user.avatar = "uploads/user_no-image.jpg"
      }

      await user.save();

      return res.status(200).json("Регистрация прошла успешно");
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: "Ошибка регистрации" });
    }
  }
}

module.exports = new authController();
