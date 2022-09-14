const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const helper = require("../utils/tests_helper");

const api = supertest(app);

beforeAll(async () => {
  await User.deleteMany({});
});

describe("when there is initially one user in db", () => {
  test("creation succeeds with a fresh username", async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("sekret", 10);
    const user = new User({ username: "root", passwordHash });

    await user.save();

    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "simonnars",
      name: "Simon Nars",
      password: "mypass",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    expect(usernames).toContain(newUser.username);
  });

  test("user creation fails with proper statuscode and message if username already taken", async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("sekret", 10);
    const user = new User({ username: "root", passwordHash });

    await user.save();

    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "root",
      name: "Testing",
      password: "mypass",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain("username must be unique");

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });

  test("user creation fails with proper statuscode and message if username is too short", async () => {
    await User.deleteMany({});

    const newUser = {
      username: "fo",
      name: "My Name",
      password: "sekret",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain(
      "username must be at least 3 characters long"
    );

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(0);
  });

  test("user creation fails with proper statuscode and message if password is too short", async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("sekret", 10);
    const user = new User({ username: "root", passwordHash });

    await user.save();

    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "someone",
      name: "My Name",
      password: "se",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain(
      "password must be at least 3 characters long"
    );

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });
});

afterAll(async () => {
  await User.deleteMany({});

  mongoose.connection.close();
});
