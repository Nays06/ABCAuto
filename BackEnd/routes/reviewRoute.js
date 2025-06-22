const Router = require('express')
const router = new Router()
const controller = require('../controllers/reviewController')
const authMiddleware = require("../middlewares/authMiddleware")

router.post("/", authMiddleware, controller.addReview)
router.get("/:id", controller.getUserReviews)

module.exports = router