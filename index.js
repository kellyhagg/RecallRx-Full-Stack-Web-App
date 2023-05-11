require("./utils.js");

require("dotenv").config();
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcrypt");
const saltRounds = 12;
const { ObjectId } = require("mongodb");

const port = process.env.PORT || 3000;

const app = express();
app.use(express.static("public"));
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

const Joi = require("joi");
const mongoSanitize = require("express-mongo-sanitize");
const { emit } = require("process");
const { type } = require("os");
const expireTime = 60 * 60 * 1000; //expires after 1 hour  (minutes * seconds * millis)

/* secret information section */
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const node_session_secret = process.env.NODE_SESSION_SECRET;
/* END secret section */

var { database } = include("databaseConnection");

const userCollection = database.db(mongodb_database).collection("users");

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));

var mongoStore = MongoStore.create({
  mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/sessions`,
  crypto: {
    secret: mongodb_session_secret,
  },
});

app.use(
  session({
    secret: node_session_secret,
    store: mongoStore, //default is memory store
    saveUninitialized: false,
    resave: true,
  })
);

app.get("/", (req, res) => {
  const username = "Olga";
  const email = "test@gmail.com";
  console.log("settings");
  res.render("login");
});

// Settings routes
app.get("/settings", (req, res) => {
  const username = req.session.username;
  const email = req.session.email;
  console.log("settings");
  res.render("settings", { userName: username, email: email });
});

// User information update routes
app.get("/user-name-edit", async (req, res) => {
  const username = req.session.username;
  const email = req.session.email;
  const user = await userCollection
    .find({ email: email })
    .project({ username: 1, email: 1, is_admin: 1, _id: 1 })
    .toArray();
  res.render("user-name-edit", { user: user });
});

app.post("/update-user-name/:userId", async (req, res) => {
  const userId = req.params.userId;
  const user = await userCollection.findOne({ _id: new ObjectId(userId) });
  const newUserName = req.body.userName;
  await userCollection.updateOne(
    { _id: new ObjectId(userId) },
    { $set: { username: newUserName } }
  );
  res.redirect("/settings");
});

app.get("/email-edit", (req, res) => {
  //   const email = req.session.email;
  const email = "test@gmail.com";
  console.log("email-edit");
  res.render("email-edit", { email: email });
});

// app.post("/update-email/:userId", (req, res) => {
app.post("/update-email", (req, res) => {
  // add db update
  res.redirect("settings");
});

app.get("/password-change", (req, res) => {
  console.log("password-change");
  res.render("password-change");
});

app.post("/update-password/:userId", (req, res) => {
  // add db update
  res.redirect("settings");
});

app.listen(port, () => {
  console.log(`Application is listening at http://localhost:${port}`);
});
