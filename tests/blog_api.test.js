const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const Blog = require("../models/blog");

const api = supertest(app);

const dummyBlogs = [
  {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
  },
  {
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
  },
  {
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
  },
  {
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
  },
  {
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
  },
  {
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
  },
];

beforeEach(async () => {
  await Blog.deleteMany({});
  const testBlog1 = new Blog(dummyBlogs[0]);
  const testBlog2 = new Blog(dummyBlogs[1]);
  await testBlog1.save();
  await testBlog2.save();
});

describe("viewing blogs", () => {
  test("blogs are returned as json", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("there are two blogs", async () => {
    const response = await api.get("/api/blogs");
    expect(response.body).toHaveLength(2);
  });

  test("the title of the first blog is right", async () => {
    const response = await api.get("/api/blogs");
    expect(response.body[0].title).toBe("React patterns");
  });

  test("id property is defined for all blogs", async () => {
    const response = await api.get("/api/blogs");
    response.body.forEach((blog) => {
      expect(blog.id).toBeDefined();
    });
  });
});

describe("addition of blogs", () => {
  test("a  blog can be added by making a post request", async () => {
    const newBlog = {
      title: "This is a new blog post",
      author: "Simon Nars",
      url: "https://example.com",
      likes: 30,
    };

    await Blog.deleteMany({});

    await api
      .post("/api/blogs")
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const response = await api.get("/api/blogs");
    expect(response.body).toHaveLength(1);
    expect(response.body[0].title).toBe("This is a new blog post");
    expect(response.body[0].author).toBe("Simon Nars");
    expect(response.body[0].url).toBe("https://example.com");
    expect(response.body[0].likes).toBe(30);
  });

  test("if likes property is missing, it should default to 0", async () => {
    const newBlog = {
      title: "This is a new blog post",
      author: "Simon Nars",
      url: "https://example.com",
    };

    await Blog.deleteMany({});
    await api
      .post("/api/blogs")
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const response = await api.get("/api/blogs");
    expect(response.body).toHaveLength(1);
    expect(response.body[0].likes).toBe(0);
  });

  test("if title and url properties are missing, the request should fail", async () => {
    const newBlog = {
      likes: 30,
      author: "Simon Nars",
    };

    await Blog.deleteMany({});
    await api.post("/api/blogs").send(newBlog).expect(400);
  });
});

describe("updating of blogs", () => {
  test("a blog can be updated", async () => {
    const response = await api.get("/api/blogs");
    const blogToUpdate = response.body[0];
    const updatedBlog = {
      ...blogToUpdate,
      likes: 100,
    };
    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog)
      .expect(200);

    const responseAfterUpdate = await api.get("/api/blogs");
    expect(responseAfterUpdate.body[0].likes).toBe(100);
  });
});

describe("deletion of blogs", () => {
  test("a blog can be deleted", async () => {
    const response = await api.get("/api/blogs");
    const blogToDelete = response.body[0];
    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

    const responseAfterDelete = await api.get("/api/blogs");
    expect(responseAfterDelete.body).toHaveLength(1);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
