const Blog = require("../models/blog");

const nonExistingId = async () => {
  const blog = new Blog({
    title: "willremovethissoon",
    author: "someone",
    likes: 2,
  });
  await blog.save();
  await blog.remove();
  return blog._id.toString();
};

module.exports = {
  nonExistingId,
};
