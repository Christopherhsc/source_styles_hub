require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.use(
  cors({
    origin: "*", // Configure according to your specific needs
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "user-id",
    ],
  })
);

app.use(bodyParser.json({ limit: "10mb" }));

mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

// Import routes
const userRouter = require("./app/routes/users");
const snippetRouter = require("./app/routes/snippets");
const searchRouter = require("./app/routes/search");

// Use routes
app.use("/users", userRouter);
app.use("/snippets", snippetRouter);
app.use("/search", searchRouter);

const port = process.env.PORT || 3000;

// Server start
app.listen(port, () => {
  console.log(`Server running at ${port}`);
});
