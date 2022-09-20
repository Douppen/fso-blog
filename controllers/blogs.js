const blogsRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");

blogsRouter.get("/", async (req, res) => {
  const blogs = await Blog.find({}).populate("user", {
    username: 1,
    name: 1,
    id: 1,
  });
  res.json(blogs);
});

blogsRouter.get("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate("user", {
    username: 1,
    name: 1,
    id: 1,
  });
  res.json(blog);
});

blogsRouter.post("/", async (req, res) => {
  if (!req.body.title) {
    return res.status(400).json({ error: "title is required" });
  }

  if (!req.body.likes) req.body.likes = 0;

  const blog = new Blog({
    ...req.body,
    user: req.user._id,
  });
  const savedBlog = await blog.save();

  const user = await User.findById(req.user._id);
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();

  const populatedResponse = {
    ...savedBlog.toJSON(),
    user: {
      username: user.username,
      name: user.name,
      id: user._id,
    },
  };

  res.status(201).json(populatedResponse);
});

blogsRouter.post("/:id/comments", async (req, res) => {
  console.log(req.body);
  const comment = req.body.comment;
  console.log(comment);

  const blog = await Blog.findById(req.params.id).populate("user", {
    username: 1,
    name: 1,
    id: 1,
  });
  blog.comments.push(comment);
  console.log(blog);
  await blog.save();

  res.status(201);
});

blogsRouter.delete("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (blog.user.toString() !== req.user._id.toString()) {
    return res.status(401).json({ error: "unauthorized" });
  }

  await Blog.findByIdAndRemove(req.params.id);

  const user = await User.findById(req.user._id);
  user.blogs = user.blogs.filter((blogId) => {
    return blogId.valueOf() !== req.params.id;
  });
  await user.save();

  res.status(204).end();
});

blogsRouter.put("/:id", async (req, res) => {
  const newBlog = req.body;

  const originalBlog = await Blog.findById(req.params.id);

  if (originalBlog.user.toString() !== req.user._id.toString()) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const result = await Blog.findByIdAndUpdate(req.params.id, newBlog, {
    new: true,
    runValidators: true,
    context: "query",
  }).populate("user", {
    username: 1,
    name: 1,
    id: 1,
  });
  res.json(result);
});

module.exports = blogsRouter;
