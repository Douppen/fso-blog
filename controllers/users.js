const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");
const Blog = require("../models/blog");
const middleware = require("../utils/middleware");

usersRouter.get("/", middleware.userExtractor, async (req, res) => {
  const users = await User.find({}).populate("blogs", {
    title: 1,
    url: 1,
    likes: 1,
    author: 1,
    id: 1,
  });

  return res.json(users);
});

usersRouter.get("/:id", middleware.userExtractor, async (req, res) => {
  const user = User.findById(req.params.id);

  if (!user) return res.status(404).json({ error: "user not found" });

  return res.json(user);
});

usersRouter.post("/", async (req, res) => {
  const { username, name, password } = req.body;

  const existingUser = await User.findOne({ username });
  if (existingUser)
    return res.status(400).json({ error: "username must be unique" });

  if (username.length < 3) {
    return res.status(400).json({
      error: "username must be at least 3 characters long",
    });
  }

  if (password.length < 3) {
    return res.status(400).json({
      error: "password must be at least 3 characters long",
    });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  const savedUser = await user.save();

  return res.status(201).json(savedUser);
});

usersRouter.delete("/:id", middleware.userExtractor, async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) return res.status(404).json({ error: "user not found" });

  if (user.id.toString() !== req.user._id.toString()) {
    return res.status(401).json({ error: "unauthorized" });
  } else {
    await User.findByIdAndRemove(req.params.id);

    for (const id of user.blogs) {
      await Blog.findByIdAndRemove(id);
    }

    return res.status(204).end();
  }
});

module.exports = usersRouter;
