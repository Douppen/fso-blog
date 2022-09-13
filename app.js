const config = require("./utils/config");
const express = require("express");
require("express-async-errors");
const app = express();
const cors = require("cors");
const blogsRouter = require("./controllers/blogs");
const middleware = require("./utils/middleware");
const logger = require("./utils/logger");
const mongoose = require("mongoose");

// CONNECT TO MONGODB
logger.info("Connecting to MongoDB");
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
app.use(middleware.requestLogger);

// APP ROUTES
app.use("/api/blogs", blogsRouter);

// MIDDLEWARE SUCCEEDING ROUTES
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
