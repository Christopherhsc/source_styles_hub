require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));

mongoose.connect(process.env.MONGODB_URI, {});
mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use(cors({
  origin: ['https://sourcestylehub.com'],
  methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH']
}));

const userRouter = require("./app/routes/users");
const snippetRouter = require("./app/routes/snippets");
const searchRouter = require("./app/routes/search");

app.use("/users", userRouter);
app.use("/snippets", snippetRouter);
app.use("/search", searchRouter);

const port = process.env.PORT || 3000;

// Listen using HTTPS server
app.listen(port, () => {
  console.log(`Server running at ${port}`);
})