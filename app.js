const config = require("./utils/config");
const express = require("express");
require("express-async-errors");
const app = express();
const cors = require("cors");
const blogsRouter = require("./controllers/blogs");
const usersRouter = require("./controllers/users");
const loginRouter = require("./controllers/login");
const middleware = require("./utils/middleware");
const logger = require("./utils/logger");
const mongoose = require("mongoose");
const path = require("path");

// CONNECT TO MONGODB
mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info("✅ Connected to MongoDB");
  })
  .catch((error) => {
    logger.error("❌ Error connecting to MongoDB:", error.message);
  });

// MIDDLEWARE PRECEDING ROUTES
app.use(cors());
app.use(express.json());
app.use(express.static("build"));
app.use(middleware.requestLogger);
app.use(middleware.tokenExtractor);

// APP ROUTES
app.use("/api/blogs", middleware.userExtractor, blogsRouter);
app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);

if (process.env.NODE_ENV === "test") {
  const testingRouter = require("./controllers/tests");
  app.use("/api/testing", testingRouter);
}

// MIDDLEWARE SUCCEEDING ROUTES
app.use((req, res) =>
  res.sendFile(path.join(__dirname, "build", "index.html"))
);
app.use(middleware.errorHandler);

module.exports = app;
