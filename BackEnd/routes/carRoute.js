const Router = require('express')
const router = new Router()
const controller = require('../controllers/carController')

router.get("/brands", controller.getBrands)
router.get("/cars", controller.getCars)

module.exports = router