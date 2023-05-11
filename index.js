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
  var user = await userCollection.findOne({ _id: new ObjectId(userId) });
  const newUserName = req.body.userName;
  await userCollection.updateOne(
    { _id: new ObjectId(userId) },
    { $set: { username: newUserName } }
  );
  user = await userCollection.findOne({
    _id: new ObjectId(userId),
  });
  req.session.username = user.username;
  res.redirect("/settings");
});

app.get("/email-edit", async (req, res) => {
  const email = req.session.email;
  const user = await userCollection
    .find({ email: email })
    .project({ username: 1, email: 1, is_admin: 1, _id: 1 })
    .toArray();
  res.render("email-edit", { user: user });
});

app.post("/update-email/:userId", async (req, res) => {
  const userId = req.params.userId;
  var user = await userCollection.findOne({ _id: new ObjectId(userId) });
  const newEmail = req.body.email;
  await userCollection.updateOne(
    { _id: new ObjectId(userId) },
    { $set: { email: newEmail } }
  );
  user = await userCollection.findOne({
    _id: new ObjectId(userId),
  });
  req.session.email = user.email;
  res.redirect("/settings");
});

app.get("/password-change", async (req, res) => {
  const email = req.session.email;
  const user = await userCollection
    .find({ email: email })
    .project({ username: 1, email: 1, is_admin: 1, _id: 1 })
    .toArray();
  res.render("password-change", { user: user });
});

app.post("/update-password/:userId", async (req, res) => {
  const userId = req.params.userId;
  var user = await userCollection.findOne({ _id: new ObjectId(userId) });
  const newPassword = req.body.password;

  console.log(newPassword);
  await userCollection.updateOne(
    { _id: new ObjectId(userId) },
    { $set: { password: newPassword } }
  );
  console.log("password updated");
  res.redirect("/settings");
});

app.listen(port, () => {
  console.log(`Application is listening at http://localhost:${port}`);
});
