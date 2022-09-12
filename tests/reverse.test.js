const listHelper = require("../utils/list_helper");
const blogs = require("../utils/list_helper").dummyBlogs;

test("dummy returns one", () => {
  const blogs = [];

  const result = listHelper.dummy(blogs);
  expect(result).toBe(1);
});

describe("total likes", () => {
  const listWithOneBlog = [
    {
      _id: "5a422aa71b54a676234d17f8",
      title: "Go To Statement Considered Harmful",
      author: "Edsger W. Dijkstra",
      url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
      likes: 5,
      __v: 0,
    },
  ];

  test("when list has only one blog, equals the likes of that", () => {
    const result = listHelper.totalLikes(listWithOneBlog);
    expect(result).toBe(5);
  });
});

describe("favorite blog", () => {
  const listWithOneBlog = [
    {
      _id: "5a422aa71b54a676234d17f8",
      title: "Go To Statement Considered Harmful",
      author: "Edsger W. Dijkstra",
      url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
      likes: 5,
      __v: 0,
    },
  ];

  test("when list has only one blog, returns that blog", () => {
    const result = listHelper.favoriteBlog(listWithOneBlog);
    expect(result).toEqual(listWithOneBlog[0]);
  });

  const listWithMultipleBlogs = blogs.slice(0, 5);

  test("when list has multiple blogs, returns the blog with the most likes", () => {
    const result = listHelper.favoriteBlog(listWithMultipleBlogs);
    expect(result).toEqual(listWithMultipleBlogs[2]);
  });
});

describe("author with most blogs", () => {
  test("when list has multiple blogs, returns the author with the most blogs", () => {
    const result = listHelper.mostBlogs(blogs);
    expect(result).toEqual({ author: "Robert C. Martin", blogs: 3 });
  });
});

describe("author with most likes", () => {
  test("when list has multiple blogs, returns the author with the most likes", () => {
    const result = listHelper.mostLikes(blogs);
    expect(result).toEqual({ author: "Edsger W. Dijkstra", likes: 17 });
  });
});
