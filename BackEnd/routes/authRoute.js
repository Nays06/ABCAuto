const Router = require("express");
const router = new Router();
const authController = require("../controllers/authController")
const upload = require("../middlewares/upload")

router.post("/registration", upload.single("avatar"), authController.reqistration);
// router.post("/login", authController.login);
// router.get("/users", authMiddleware, authController.getUsers);
// router.get("/profile", authMiddleware, authController.getProfile);

module.exports = router;