const Router = require('express')
const router = new Router()
const controller = require('../controllers/postController')
const authMiddleware = require("../middlewares/authMiddleware")
const adminMiddleware = require("../middlewares/adminMiddleware")
const upload = require("../middlewares/upload")

router.post("/", authMiddleware, adminMiddleware, upload.single("img"), controller.addPost)
router.get("/", controller.getPosts)
router.delete("/:id", authMiddleware, adminMiddleware, controller.deletePost)

module.exports = router