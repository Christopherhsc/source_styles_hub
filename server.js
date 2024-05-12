require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

// CORS configuration
const corsOptions = {
  origin: 'https://sourcestylehub.com', 
  methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: "10mb" }));

mongoose.connect(process.env.MONGODB_URI, {});
mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

// Simple test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

const userRouter = require("./app/routes/users");
const snippetRouter = require("./app/routes/snippets");
const searchRouter = require("./app/routes/search");

app.use("/users", userRouter);
app.use("/snippets", snippetRouter);
app.use("/search", searchRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at ${port}`);
});
