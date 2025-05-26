const Router = require('express')
const router = new Router()
const controller = require('../controllers/favoriteController')
const authMiddleware = require("../middlewares/authMiddleware")

router.get("/", authMiddleware, controller.getUserFavorites)
router.post("/", authMiddleware, controller.addToFavorites)
router.delete("/:id", authMiddleware, controller.removeFromFavorites)
router.get("/cars", authMiddleware, controller.getUserFavoriteCars)

module.exports = router