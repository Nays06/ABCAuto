const Router = require("express");
const router = new Router();
const authController = require("../controllers/authController")
const upload = require("../middlewares/upload")
const authMiddleware = require("../middlewares/authMiddleware")

router.post("/registration", upload.single("avatar"), authController.registration);
router.post("/login", authController.login);
router.get("/profile", authMiddleware, authController.getProfile);
router.get("/profile/:id", authController.getProfileToId);
router.get("/avatar", authMiddleware, authController.getAvatar);
router.get("/id", authMiddleware, authController.getID);
router.get('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/balance', authMiddleware, authController.getBalance);
router.post('/balance', authMiddleware, authController.setBalance);

module.exports = router;