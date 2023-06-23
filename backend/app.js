const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
var logger = require("morgan");
var path = require("path");
const cors = require("cors");

app.use(cors());

// Static Middleware
const public = path.resolve(__dirname, "public");
app.use(express.static(public));

// View Engine Setup
app.set("views", path.join(__dirname, "views"));

// view engine setup
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({ path: "./config/config.env" });
}

const sessionRoutes = require("./routes/sessionRoutes");

app.use("/api/session", sessionRoutes);

app.use("/public", express.static(path.join(__dirname, "public")));

//Routes Section End--------------------------

// app.use(express.static(path.join(__dirname, "../frontend/build")));

// app.get("*", (req, res) => {
//   res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"));
// });

module.exports = app;
