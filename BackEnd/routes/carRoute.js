const Router = require('express')
const router = new Router()
const controller = require('../controllers/carController')
const authMiddleware = require("../middlewares/authMiddleware")
const upload = require("../middlewares/upload")

router.get("/brands", controller.getBrands)
router.get("/cars", controller.getCars)
router.post("/add", authMiddleware, upload.array("image[]", 10), controller.addCar)

module.exports = router