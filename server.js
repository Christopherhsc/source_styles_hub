require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

// Configure CORS for your front-end domain and allowed methods
app.use(cors({
  origin: 'https://sourcestylehub.com', // Set the allowed origin
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'] // Correctly list HTTP methods
}));

app.use(bodyParser.json({ limit: "10mb" }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

// Basic route to check API status
app.get("/", (req, res) => {
  res.send("API is running...");
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
