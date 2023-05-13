require("./utils.js");

require("dotenv").config();
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcrypt");
const saltRounds = 12;

const port = process.env.PORT || 3000;

const app = express();

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

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(express.urlencoded({ extended: false }));

var { database } = include("databaseConnection");
const userCollection = database.db(mongodb_database).collection("users");

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

function isValidSession(req) {
  return req.session.authenticated;
}

function validateSession(req, res, next) {
  if (isValidSession(req)) {
    next();
  } else {
    res.redirect("login");
  }
}

app.get("/", (req, res) => {
  //   res.send("Hello World");
  res.redirect("/login");
});

// Log in API
// This block of code is modified from COMP 2537 Assignment 2 by Olga Zimina.
app.get("/loginFailure", (req, res) => {
  var errorMsg = "Invalid email or password.  Please, try again";
  var target = "/login";
  res.render("error-page", { errorMsg: errorMsg, target: target });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  console.log("inside login");
  var username = req.body.userName;
  var password = req.body.password;

  const schema = Joi.object({
    username: Joi.string().max(30).required(),
    password: Joi.string().max(20).required(),
  });

  const validationResult = schema.validate({ username, password });
  if (validationResult.error != null) {
    console.log(validationResult.error);
    res.redirect("/login");
    return;
  }

  const user = await userCollection
    .find({ username: username })
    .project({ username: 1, email: 1, password: 1, is_admin: 1, _id: 1 })
    .toArray();
  if (!user) {
    console.log("User not found");
    res.redirect("/loginFailure");
    return;
  }
  const passwordMatch = await bcrypt.compare(password, user[0].password);

  if (passwordMatch) {
    req.session.authenticated = true;
    req.session.username = username;
    req.session.email = user[0].email;
    req.session.cookie.maxAge = expireTime;
    res.redirect("/home");
    return;
  } else {
    console.log("Invalid email or password");
    res.redirect("/loginFailure");
    return;
  }
});

app.use("/loggedIn", validateSession);
app.get("/loggedIn", (res, req) => {
  console.log("loggedin");
  console.log(req.session.is_admin);
  res.redirect("/home");
});

app.get("/home", (req, res) => {});

// End of login API

app.listen(port, () => {
  console.log(`Application is listening at http://localhost:${port}`);
});
