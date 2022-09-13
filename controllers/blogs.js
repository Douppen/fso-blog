const blogsRouter = require("express").Router();
const Blog = require("../models/blog");

blogsRouter.get("/", (req, res) => {
  Blog.find({}).then((blogs) => {
    res.json(blogs);
  });
});

blogsRouter.get("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  res.json(blog);
});

blogsRouter.post("/", async (req, res) => {
  if (!req.body.title && !req.body.url) {
    return res.status(400).end();
  }

  if (!req.body.likes) {
    req.body.likes = 0;
  }

  const blog = new Blog(req.body);
  const resolvedRes = await blog.save();
  res.status(201).json(resolvedRes);
});

blogsRouter.delete("/:id", async (req, res) => {
  const id = req.params.id;
  await Blog.findByIdAndRemove(id);
  res.status(204).end();
});

blogsRouter.put("/:id", async (req, res) => {
  const newBlog = req.body;

  const result = await Blog.findByIdAndUpdate(req.params.id, newBlog, {
    new: true,
    runValidators: true,
    context: "query",
  });
  res.json(result);
});

module.exports = blogsRouter;
