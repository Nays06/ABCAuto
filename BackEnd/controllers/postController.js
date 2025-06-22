const Post = require("../models/Post");

class postController {
  async addPost(req, res) {
    try {
      //   const userId = req.user.id;
      const { title, text } = req.body;

      const post = new Post({
        title,
        text,
      });

      if (req.file) {
        post.img = req.file.path;
      } else {
        res.status(402).json({ message: "Фото для поста обязательно" });
      }

      post.save();

      return res.status(200).json({ message: "Пост успешно добавлен", post });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  }

  async getPosts(req, res) {
    try {
      const posts = await Post.find().sort({ _id: -1 });
      res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: "Ошибка сервера" })
        console.log(error)
    }
  }

  async deletePost(req, res) {
    try {
      const id = req.params.id;
      
      await Post.findByIdAndDelete({ _id: id })
      res.status(200).json({ message: "Пост успешно удален" });
    } catch (error) {
        res.status(500).json({ message: "Ошибка сервера" })
        console.log(error)
    }
  }
}

module.exports = new postController();
