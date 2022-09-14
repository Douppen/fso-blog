const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const Blog = require("../models/blog");
const User = require("../models/user");

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

let token;

beforeAll(async () => {
  await User.deleteMany({});

  const user = {
    username: "fortesting",
    name: "John Doe",
    password: "secret",
  };

  await api.post("/api/users").send(user);

  const tokenResponse = await api
    .post("/api/login")
    .send({ username: user.username, password: user.password });

  token = tokenResponse.body.token;
});

describe("viewing blogs", () => {
  beforeEach(async () => {
    const user = await User.findOne({ username: "fortesting" });
    user.blogs = [];
    user.save();

    await Blog.deleteMany({});
    await api
      .post("/api/blogs")
      .send(dummyBlogs[0])
      .set("Authorization", `bearer ${token}`);
    await api
      .post("/api/blogs")
      .send(dummyBlogs[1])
      .set("Authorization", `bearer ${token}`);
  });

  test("blogs are returned as json", async () => {
    await api
      .get("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("there are two blogs", async () => {
    const response = await api
      .get("/api/blogs")
      .set("Authorization", `Bearer ${token}`);
    expect(response.body).toHaveLength(2);
  });

  test("the title of the first blog is right", async () => {
    const response = await api
      .get("/api/blogs")
      .set("Authorization", `Bearer ${token}`);
    expect(response.body[0].title).toBe("React patterns");
  });

  test("id property is defined for all blogs", async () => {
    const response = await api
      .get("/api/blogs")
      .set("Authorization", `Bearer ${token}`);
    response.body.forEach((blog) => {
      expect(blog.id).toBeDefined();
    });
  });
});

describe("addition of blogs", () => {
  test("a  blog can be added by making a post request", async () => {
    const newBlog = {
      title: "This is a new blog post",
      author: "John Doe",
      url: "https://example.com",
      likes: 30,
    };

    await Blog.deleteMany({});

    await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const response = await api
      .get("/api/blogs")
      .set("Authorization", `Bearer ${token}`);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].title).toBe("This is a new blog post");
    expect(response.body[0].author).toBe("John Doe");
    expect(response.body[0].url).toBe("https://example.com");
    expect(response.body[0].likes).toBe(30);
  });

  test("if likes property is missing, it should default to 0", async () => {
    const newBlog = {
      title: "This is a new blog post",
      author: "John Doe",
      url: "https://example.com",
    };

    await Blog.deleteMany({});

    await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const response = await api
      .get("/api/blogs")
      .set("Authorization", `Bearer ${token}`);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].likes).toBe(0);
  });

  test("if title and url properties are missing, the request should fail", async () => {
    const newBlog = {
      likes: 30,
      author: "John Doe",
    };

    await Blog.deleteMany({});
    await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(newBlog)
      .expect(400);
  });

  test("if token is missing, the request should fail", async () => {
    const newBlog = {
      title: "This is a new blog post",
      author: "John Doe",
      url: "https://example.com",
      likes: 30,
    };

    await Blog.deleteMany({});

    const res = await api.post("/api/blogs").send(newBlog).expect(401);

    expect(res.body.error).toBe("unauthorized");
  });
});

describe("updating of blogs", () => {
  beforeEach(async () => {
    const user = await User.findOne({ username: "fortesting" });
    user.blogs = [];
    user.save();

    await Blog.deleteMany({});
    await api
      .post("/api/blogs")
      .send(dummyBlogs[0])
      .set("Authorization", `bearer ${token}`);
    await api
      .post("/api/blogs")
      .send(dummyBlogs[1])
      .set("Authorization", `bearer ${token}`);
  });

  test("a blog can be updated by the right user", async () => {
    const response = await api
      .get("/api/blogs")
      .set("Authorization", `Bearer ${token}`);
    const blogToUpdate = response.body[0];
    const updatedBlog = {
      title: "React patterns",
      author: "Michael Chan",
      url: "https://reactpatterns.com/",
      likes: 100,
    };
    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updatedBlog)
      .expect(200);

    const responseAfterUpdate = await api
      .get("/api/blogs")
      .set("Authorization", `Bearer ${token}`);

    expect(responseAfterUpdate.body[0].likes).toBe(100);
  });
});

describe("deletion of blogs", () => {
  beforeEach(async () => {
    const user = await User.findOne({ username: "fortesting" });
    user.blogs = [];
    user.save();

    await Blog.deleteMany({});
    await api
      .post("/api/blogs")
      .send(dummyBlogs[0])
      .set("Authorization", `bearer ${token}`);
    await api
      .post("/api/blogs")
      .send(dummyBlogs[1])
      .set("Authorization", `bearer ${token}`);
  });

  test("a blog can be deleted", async () => {
    const response = await api
      .get("/api/blogs")
      .set("Authorization", `Bearer ${token}`);
    const blogToDelete = response.body[0];
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(204);

    const responseAfterDelete = await api
      .get("/api/blogs")
      .set("Authorization", `Bearer ${token}`);
    expect(responseAfterDelete.body).toHaveLength(1);
  });

  test("a blog cannot be deleted by a different user, code 401 unauthorized should be received", async () => {
    const maliciousUser = {
      username: "maliciousUser",
      name: "Malicious User",
      password: "maliciousPassword",
    };

    await api.post("/api/users").send(maliciousUser);
    const loginResponse = await api
      .post("/api/login")
      .send({ username: "maliciousUser", password: "maliciousPassword" });
    const maliciousToken = loginResponse.body.token;

    const getResponse = await api
      .get("/api/blogs")
      .set("Authorization", `Bearer ${token}`);

    const blogToDelete = getResponse.body[0];

    const deleteResponse = await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set("Authorization", `Bearer ${maliciousToken}`)
      .expect(401);

    expect(deleteResponse.body.error).toBe("unauthorized");
  });
});

afterAll(async () => {
  await User.deleteMany({});
  await Blog.deleteMany({});

  mongoose.connection.close();
});
