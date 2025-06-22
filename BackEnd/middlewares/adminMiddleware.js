const User = require("../models/User");

module.exports = async function (req, res, next) {
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    const user = await User.findById(req.user.id);
    
    if (!user.roles.includes("ADMIN")) {
      return res.status(403).json({ message: "Доступ запрещен: требуется роль ADMIN" });
    }
    
    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    return res.status(500).json({ message: "Ошибка сервера при проверке прав администратора" });
  }
};