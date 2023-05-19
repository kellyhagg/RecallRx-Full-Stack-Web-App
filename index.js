// Import necessary modules and packages
require("./utils.js");
require("dotenv").config();

const EXERCISE_TIME_GOAL = 25; // minutes per day, default exercise time goal
const ALCOHOL_CONSUMPTION_LIMIT = 2; // drinks per day low alcohol drink, default alcohol consumption limit
const SMOKE_COUNT_LIMIT = 10; // cigarette per day, default smoke count limit
const SOCIAL_TIME_GOAL = 25; // minutes per day, default social time goal
const CHALLENGE_PERIOD = 4; // day we check the trend of

const express = require("express"); // import express
const session = require("express-session"); // import express-session
const bodyParser = require("body-parser"); // import body-parser
const MongoStore = require("connect-mongo"); // import connect-mongo
const bcrypt = require("bcrypt"); // import bcrypt
const saltRounds = 12; // set salt rounds for bcrypt
const { ObjectId } = require("mongodb"); // import ObjectId from mongodb

// Set up the port number to listen on
const port = process.env.PORT || 3000;

// Create the Express application
const app = express();
app.use(express.static("public")); // set up the static files
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

const Joi = require("joi"); // import Joi
const mongoSanitize = require("express-mongo-sanitize"); // import express-mongo-sanitize
const { emit } = require("process"); // import process
const { type } = require("os"); // import os
const {
  getObject,
  getSentence,
  getSentenceScore,
  getOrientationScore,
  getObjectScore,
  getWord,
  getReversalScore,
} = require("./public/scripts/mmse.js"); // import mmse.js
const jwt = require("jsonwebtoken"); // import jsonwebtoken
const nodemailer = require("nodemailer"); // import nodemailer
const fs = require("fs"); // import fs
const expireTime = 60 * 60 * 1000; //expires after 1 hour  (minutes * seconds * millis)

/* secret information section */
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const node_session_secret = process.env.NODE_SESSION_SECRET;
const jwt_secret = process.env.JSON_WEB_TOKEN_SECRET;
const app_email_address = process.env.EMAIL_ADDRESS;
const app_email_password = process.env.EMAIL_PASSWORD;
/* END secret section */

const mmse = require("./public/scripts/mmse.js");
const { start } = require("repl");
// Set up the view engine and static files
app.set("view engine", "ejs"); // set up the view engine
app.use(express.json()); // use express.json() to parse JSON bodies

// Connect to the database
var { database } = include("databaseConnection");
const userCollection = database.db(mongodb_database).collection("users"); // get the user collection
const activityCollection = database
  .db(mongodb_database)
  .collection("activities"); // get the activity collection
const notificationsCollection = database
  .db(mongodb_database)
  .collection("notifications"); // get the notifications collection

var mongoStore = MongoStore.create({
  mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/sessions`,
  crypto: {
    secret: mongodb_session_secret,
  },
});

// file1.js
const myGlobalVar = "Hello, world!";

var userScore = 0;
module.exports = userScore;

var pageCount = 1;
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));

app.use(
  mongoSanitize()
  //{replaceWith: '%'}
);
app.use(bodyParser.urlencoded({ extended: true }));
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

// Function to check if the user has a valid session
function isValidSession(req) {
  return req.session.authenticated;
}

// Middleware to validate user sessions
function validateSession(req, res, next) {
  if (isValidSession(req)) {
    next();
  } else {
    res.redirect("login");
  }
}

// Validate user session, if valid, redirect to homepage
app.get("/", (req, res) => {
  if (isValidSession(req)) {
    res.redirect("/homepage");
  } else {
    res.render("index");
  }
});

// post method for login
app.post("/", (req, res) => {
  res.redirect("/");
});

// get method for signup, with default error message set to empty
app.get("/signup", (req, res) => {
  if (isValidSession(req)) {
    res.redirect("/homepage");
  } else {
    res.render("signup", { errorMessage: "" });
  }
});

// post method for signup
app.post("/signup", async (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const userId = req.body.userId;
  console.log("userId: ", userId);
  const password = req.body.password;

  // validate the input style for username, email and password using Joi
  const schema = Joi.object({
    username: Joi.string().alphanum().max(40).required(),
    email: Joi.string().max(20).required(),
    password: Joi.string().max(20).required(),
  });

  // validate the input
  const validationResult = schema.validate({ username, email, password });
  if (validationResult.error != null) {
    console.log(validationResult.error);
    res.redirect("/signup", { errorMessage: "" });
    return;
  }

  // check if username already exists in databse
  const existingUser = await userCollection.findOne({ username });
  if (existingUser) {
    console.log("Username already exists");
    const errorMessage =
      "Username already exists, please choose another username.";
    res.render("signup", { errorMessage: errorMessage });
    return;
  }

  // hash the password
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Set notification configuration
  const currentDate = new Date();
  // insert the user into the database
  const result = await userCollection.insertOne({
    username: username,
    email: email,
    password: hashedPassword,
    educationLevel: null,
    age: null,
    smoke: null,
    diabetes: null,
    depression: null,
    createdAt: currentDate.toISOString(),
  });

  // Set notification configuration
  // default nextExercise notification in 2 weeks
  const nextExerciseNotification = new Date(currentDate.getTime());
  nextExerciseNotification.setHours(7 * 2 * 24);

  // default nextMMSE notification in one week
  const nextMMSENotification = new Date(currentDate.getTime());
  nextMMSENotification.setHours(7 * 24);

  // insert the user's notification configuration into the database
  const notificationSetResult = await notificationsCollection.insertOne({
    userId: result.insertedId.toString(),
    exercise: {
      frequency: "daily", // default frequency
      isActive: true, // default enabled
      next: nextExerciseNotification.toISOString(), // default next 2 weeks
    },
    mmse: {
      frequency: "every-other-week", // default frequency
      isActive: true, // default enabled
      next: nextMMSENotification.toISOString(), // default next 2 weeks
    },
  });

  console.log("Inserted user through signup");

  // store the userId in the session
  req.session.userId = result.insertedId;
  // store the user name in the session
  req.session.username = username;
  // store the user email in the session
  req.session.email = email;
  // set authenticated to true
  req.session.authenticated = true;

  // redirect to the risk factor survey page
  res.redirect("/riskfactorsurvey");
});

async function checkChallengeTrend(username) {
  const currentDate = new Date();
  var checkingTs = currentDate.setHours(0, 0, 0, 0);
  var challengePeriod = []; // prepare array for challenge period
  for (let i = 1; i < CHALLENGE_PERIOD; i++) {
    var day = new Date(currentDate); // Create a new Date object with the current date
    day.setDate(currentDate.getDate() - i); // Subtract i days from the current date
    day = day.toISOString().slice(0, 10); // Format the date as YYYY-MM-DD
    challengePeriod.push(day);
    console.log(day);
  }
  // Query the activityCollection to get the challenge trend for the specified username and challengePeriod
  const challengeTrend = await activityCollection
    .find({
      username: username,
      date: { $in: challengePeriod },
    })
    .project({ isOnTrack: 1 })
    .toArray();
  if (
    challengeTrend.length === 3 &&
    challengeTrend.every((day) => day.isOnTrack === true)
  ) {
    console.log("All challenge trend days are on track");
    return true;
  } else {
    console.log("Challenge trend days do not meet the condition");
    return false;
  }
}

// Middleware to validate user session before accessing homepage
app.use("/homepage", validateSession);
// get method for homepage
app.get("/homepage", async (req, res) => {
  var isEasterEggActivated = await checkChallengeTrend(req.session.username);
  console.log(isEasterEggActivated);
  console.log("render home");
  // TO DO: add function to decide whether to show easter egg
  // var isEasterEggActivated = true;
  res.render("homepage", { isEasterEggActivated: isEasterEggActivated });
});

app.use("/riskfactorsurvey", validateSession);
// get method for risk factor survey
app.get("/riskfactorsurvey", (req, res) => {
  res.render("riskfactorsurvey");
});

app.use("/riskfactorquestions", validateSession);
// get method for risk factor survey
app.get("/riskfactorquestions", (req, res) => {
  res.render("riskfactorquestions");
});

// post method for risk factor survey
app.post("/riskfactorquestions", async (req, res) => {
  const educationLevel = req.body.educationLevel;
  const age = req.body.age;
  const smoke = req.body.smoke;
  const diabetes = req.body.diabetes;
  const depression = req.body.depression;

  // validate the input style for educationLevel, age, smoke, diabetes and depression using Joi
  const schema = Joi.object({
    educationLevel: Joi.string().required(),
    age: Joi.string().required(),
    smoke: Joi.string().required(),
    diabetes: Joi.string().required(),
    depression: Joi.string().required(),
  });

  // validate the input
  const validationResult = schema.validate({
    educationLevel,
    age,
    smoke,
    diabetes,
    depression,
  });
  if (validationResult.error != null) {
    console.log(validationResult.error);
    res.redirect("/riskfactorquestions");
    return;
  }

  // retrieve the user ID from the session
  const userId = req.session.userId;

  // insert the user's risk factor survey results into the database and save it to the same document
  await userCollection.updateOne(
    { _id: ObjectId(userId) },
    {
      $set: {
        educationLevel: educationLevel,
        age: age,
        smoke: smoke,
        diabetes: diabetes,
        depression: depression,
      },
    }
  );

  console.log("Inserted user survey");

  // redirect to the homepage when user finishes survey
  res.redirect("/surveyfinished");
});

// get method for survey finished page
app.get("/surveyfinished", (req, res) => {
  res.render("surveyfinished");
});

app.get("/mmse-landing-page", (req, res) => {
  userScore = 0;
  pageCount = 1;
  res.render("mmse-landing-page", { headerMessage: "MMSE Questionnaire" });
});

app.post("/mmse-landing-page", async (req, res) => {
  res.redirect("/mmse-orientation");
});

app.get("/mmse-orientation", (req, res) => {
  res.render("mmse-orientation.ejs", { headerMessage: "MMSE Questionnaire" });
});

app.post("/mmse-orientation", async (req, res) => {
  var year = req.body.year;
  var month = req.body.month;
  var day = req.body.day;

  userScore = userScore + getOrientationScore(year, month, day);
  console.log("userScore: " + userScore);
  res.redirect("/mmse-object-recall");
  return;
});

app.get("/mmse-object-recall", async (req, res) => {
  const object = getObject();
  res.render("mmse-object-recall.ejs", {
    headerMessage: "MMSE Questionnaire",
    object: object,
    pageCount: pageCount++,
  });
});

app.post("/mmse-object-recall", async (req, res) => {
  const object = req.body.object;
  const inputObject = req.body.inputObject;
  userScore = userScore + getObjectScore(inputObject, object);
  console.log("userScore: " + userScore);

  if (pageCount <= 3) {
    res.redirect("/mmse-object-recall");
  } else {
    pageCount = 1;
    res.redirect("/mmse-sentence-recall");
  }
});

app.get("/mmse-sentence-recall", (req, res) => {
  const sentence = getSentence();
  res.render("mmse-sentence-recall.ejs", {
    headerMessage: "MMSE Questionnaire",
    sentence: sentence,
  });
});

app.post("/mmse-sentence-recall", async (req, res) => {
  const sentence = req.body.sentence;
  const inputSentence = req.body.inputSentence;
  userScore = userScore + getSentenceScore(inputSentence, sentence);
  console.log("userScore: " + userScore);
  res.redirect("/mmse-word-reversal");
});

app.get("/mmse-word-reversal", async (req, res) => {
  var word = getWord();
  console.log("word: " + word);
  res.render("mmse-word-reversal.ejs", {
    headerMessage: "MMSE Questionnaire",
    word: word,
    pageCount: pageCount++,
  });
});

app.post("/mmse-word-reversal", async (req, res) => {
  const word = req.body.word;
  const inputWord = req.body.inputWord;
  userScore = userScore + getReversalScore(inputWord, word);
  console.log("userScore: " + userScore);

  if (pageCount <= 3) {
    res.redirect("/mmse-word-reversal");
  } else {
    pageCount = 1;
    res.redirect("/mmse-results");
  }
});

app.get("/mmse-results", (req, res) => {
  var score = parseInt(Math.round((userScore / 15) * 100));
  res.render("mmse-results.ejs", {
    headerMessage: "MMSE Results",
    score: score,
  });
  userScore = 0;
});

// Login API
// This block of code is modified from COMP 2537 Assignment 2 by Olga Zimina.

// Render login page
app.get("/login", (req, res) => {
  res.render("login", { errorMsg: "", username: "" });
});

// Handle login form submission
app.post("/login", async (req, res) => {
  console.log("inside login");
  var username = req.body.userName;
  var password = req.body.password;

  // Validate user input
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
  // Retrieve user information from database
  const user = await userCollection
    .find({ username: username })
    .project({ username: 1, email: 1, password: 1, _id: 1 })
    .toArray();
  if (!user[0]) {
    console.log("User not found");
    res.render("login", {
      errorMsg: "Invalid user name or password",
      username: username,
    });
    return;
  }
  console.log(user);
  // Check password match and set session variables
  const passwordMatch = await bcrypt.compare(password, user[0].password);
  if (passwordMatch) {
    req.session.authenticated = true;
    req.session.username = username; // store user name in the session
    req.session.email = user[0].email; // store user email in the session
    req.session.userId = user[0]._id; // store user id in the session
    req.session.cookie.maxAge = expireTime;
    res.redirect("/homepage");
    return;
  } else {
    console.log("Invalid user name or password");
    res.render("login", {
      errorMsg: "Invalid user name or password",
      username: username,
    });
    return;
  }
});

// Middleware to validate user session
app.use("/loggedIn", validateSession);

// Route to handle user session validation
app.get("/loggedIn", (res, req) => {
  console.log("loggedin");
  res.redirect("/homepage");
});
// End of Login API

// Forgot Password API
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: app_email_address,
    pass: app_email_password,
  },
});

async function sendEmail(to, subject, message) {
  try {
    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: app_email_address,
      to: to,
      subject: subject,
      html: message,
    });

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.log(error);
  }
}

app.get("/forgot-password", (req, res) => {
  res.render("forgot-password", { errorMsg: "" });
});

app.post("/forgot-password", async (req, res) => {
  console.log("inside forgot password request");
  const email = req.body.email;

  // validate the input style for username, email and password using Joi
  const schema = Joi.object({
    email: Joi.string().max(50).required(),
  });

  // validate the input
  const validationResult = schema.validate({ email });
  if (validationResult.error != null) {
    console.log("error" + validationResult.error);
    res.render("forgot-password", {
      errorMsg: validationResult.error.message,
    });
    return;
  }
  console.log("validated");

  // Retrieve user information from database
  const user = await userCollection
    .find({ email: email })
    .project({ username: 1, email: 1, _id: 1, password: 1 })
    .toArray();
  if (!user[0]) {
    console.log("User not found");
    res.render("forgot-password", {
      errorMsg: `User with email ${email} is not found. Please, check your email address.`,
    });
    console.log("User not found");
    return;
  }
  console.log(user);

  // Create a onetime link valid for a day
  const secret = jwt_secret + user[0].password;
  const payload = {
    email: user[0].email,
    id: user[0]._id,
  };
  console.log("payload" + payload);
  const token = jwt.sign(payload, secret, { expiresIn: "1d" });
  //  TO DO
  const link = `https://recallrx.cyclic.app/reset-password/${user[0]._id}&auth=${token}`;
  // const link = `http://localhost:3000/reset-password/${user[0]._id}&auth=${token}`;
  console.log(link);
  //TO DO: send email
  fs.readFile(
    __dirname + "/emails/reset-password-email.html",
    "utf8",
    (err, data) => {
      // Replace the placeholder with the error message
      var modifiedData = data.replace("{username}", user[0].username);
      modifiedData = modifiedData.replace("{resetLink}", link);
      modifiedData = modifiedData.replace("{appEmail}", app_email_address);
      sendEmail(email, "Reset password for RecallRx", modifiedData);
    }
  );
  req.session.messageData = {
    message:
      "Your reset password link is invalid or expired. Please, check your email for correct link or request a new reset password.",
    action: "/login",
    btnLabel: "Go to Sign In",
    isError: false,
  };
  res.redirect("/messages");
});

app.get("/reset-password/:id&auth=:token", async (req, res) => {
  try {
    const { id, token } = req.params;
    //  Verify token
    // Check if id exists in database
    const user = await userCollection.findOne(
      {
        _id: new ObjectId(id),
      },
      {
        projection: { username: 1, email: 1, _id: 1, password: 1 },
      }
    );

    // Handle case where provided id is invalid
    if (!user) {
      res.render("forgot-password", {
        errorMsg: `User with is not found. Please, check your email address.`,
      });
      return;
    }
    console.log("user found");
    // Handle reset password for user with provided id
    const secret = jwt_secret + user.password;

    const payload = jwt.verify(token, secret);
    res.render("reset-password", { userName: user.username });
  } catch (error) {
    console.log(error.message);
    req.session.messageData = {
      message:
        "Your reset password link is invalid or expired. Please, check your email for correct link or request a new reset password.",
      action: "/forgot-password",
      btnLabel: "Go to Forgot Password",
      isError: true,
    };
    res.redirect("/messages");
  }
});

app.post("/reset-password/:id&auth=:token", async (req, res) => {
  // Extract the id, token, and password from the request
  const { id, token } = req.params;
  const { password } = req.body;
  console.log("inside post reset password");
  // Check if id exists in database
  const user = await userCollection.findOne(
    { _id: new ObjectId(id) },
    { projection: { username: 1, email: 1, _id: 1, password: 1 } }
  );
  console.log(user);
  // Handle case where provided id is invalid
  if (!user) {
    console.log("User not found");
    // Set an error message in the session
    req.session.messageData = {
      message:
        "Your reset password link is invalid. Please, check your email for correct link or request a new reset password.",
      action: "/forgot-password",
      btnLabel: "Go to Forgot Password",
      isError: true,
    };
    res.redirect("/messages");
    console.log("ID is not valid");
    return;
  }
  // Handle reset password for user with provided id
  const secret = jwt_secret + user.password;
  try {
    const payload = jwt.verify(token, secret);

    // Hash the password and update it in the database
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await userCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { password: hashedPassword } }
    );
    // Set a success message in the session
    req.session.messageData = {
      message: "Your password has been updated.",
      action: "/login",
      btnLabel: "Go to Sign In",
      isError: false,
    };
    res.redirect("/messages");
  } catch (error) {
    console.log("inside try catch");
    console.log(error.message);
    // Set an error message in the session
    req.session.messageData = {
      message:
        "Your reset password link is invalid. Please, check your email for correct link or request a new reset password.",
      action: "/forgot-password",
      btnLabel: "Go to Forgot Password",
      isError: true,
    };
    res.redirect("/messages");
  }
});

app.get("/messages", (req, res) => {
  const messageData = req.session.messageData;
  res.render("messages", {
    message: messageData.message,
    action: messageData.action,
    btnLabel: messageData.btnLabel,
    isError: messageData.isError,
  });
});

// End of forgot password API

// Settings routes
app.use("/settings", validateSession);
app.get("/settings", (req, res) => {
  const username = req.session.username;
  const email = req.session.email;
  console.log(username, email);
  // res.render("settings", { userName: username, email: email });
  res.render("settings", {
    userName: username,
    email: email,
    data: "",
    showPopUp: false,
  });
});

// User information update routes
app.use("/user-name-edit", validateSession);
app.get("/user-name-edit", async (req, res) => {
  const username = req.session.username;
  const email = req.session.email;
  const user = await userCollection
    .find({ username: username })
    .project({ username: 1, email: 1, password: 1, _id: 1 })
    .toArray();
  console.log(user);
  res.render("user-name-edit", { user: user, errorMsg: "" });
});

app.post("/update-user-name/:userId", async (req, res) => {
  const userId = req.params.userId;
  var user = await userCollection
    .find({ _id: new ObjectId(userId) })
    .project({ username: 1, email: 1 })
    .toArray();
  const newUserName = req.body.userName;
  const anyUser = await userCollection.findOne(
    { username: newUserName },
    { projection: { username: 1 } }
  );
  if (anyUser) {
    res.render("user-name-edit", {
      user: user,
      errorMsg: `User with user name ${newUserName} already exists. Please select different user name.`,
    });
    return;
  }
  await userCollection.updateOne(
    { _id: new ObjectId(userId) },
    { $set: { username: newUserName } }
  );
  user = await userCollection.findOne({
    _id: new ObjectId(userId),
  });

  console.log("post user name - user: " + user.username);
  req.session.username = user.username;
  res.render("settings", {
    userName: user.username,
    email: user.email,
    data: "user name",
    showPopUp: true,
  });
  // res.redirect("/settings");
});

app.use("/email-edit", validateSession);
app.get("/email-edit", async (req, res) => {
  const email = req.session.email;
  const user = await userCollection.findOne(
    { email: email },
    { projection: { username: 1, email: 1, is_admin: 1, _id: 1 } }
  );

  console.log("get email - user: " + user);
  res.render("email-edit", {
    userId: user._id,
    userEmail: user.email,
    errorMsg: "",
  });
});

app.post("/update-email/:userId", async (req, res) => {
  const userId = req.params.userId;
  var user = await userCollection.findOne({ _id: new ObjectId(userId) });
  const email = req.body.email;
  // validate the input style for username, email and password using Joi
  const schema = Joi.object({
    email: Joi.string().max(50).required(),
  });
  // validate the input
  const validationResult = schema.validate({ email });
  if (validationResult.error != null) {
    res.render("email-edit", {
      userId: user._id,
      userEmail: user.email,
      errorMsg: validationResult.error.message,
    });
    return;
  }
  const anyUser = await userCollection.findOne(
    { email: email },
    { projection: { email: 1 } }
  );
  if (anyUser) {
    res.render("email-edit", {
      userId: user._id,
      userEmail: user.email,
      errorMsg: `User with email ${email} already exists. Please choose a different email address.`,
    });
    return;
  }
  await userCollection.updateOne(
    { _id: new ObjectId(userId) },
    { $set: { email: email } }
  );
  user = await userCollection.findOne({
    _id: new ObjectId(userId),
  });

  req.session.email = user.email;
  res.render("settings", {
    userName: user.username,
    email: user.email,
    data: "emails",
    showPopUp: true,
  });
  // res.redirect("/settings");
});

app.use("/password-change", validateSession);
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

  // Hash the password and update it in the database
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
  console.log(hashedPassword);
  await userCollection.updateOne(
    { _id: new ObjectId(userId) },
    { $set: { password: hashedPassword } }
  );
  console.log("password updated");
  res.render("settings", {
    userName: user.username,
    email: user.email,
    data: "password",
    showPopUp: true,
  });
  // res.redirect("/settings");
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.render("index");
});

// End of Settings API
app.use("/notifications", validateSession);
// Start notification API
app.get("/notifications", async (req, res) => {
  try {
    const { userId } = req.session;

    const notifications = await notificationsCollection.findOne({ userId });

    const date = new Date(notifications.exercise.next);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    const options = {
      exercise: {
        isActive: notifications.exercise.isActive,
        frequency: notifications.exercise.frequency,
        time: `${hours}:${minutes}`,
      },
      mmse: {
        isActive: notifications.mmse.isActive,
        frequency: notifications.mmse.frequency,
      },
    };

    res.render("notifications", options);
  } catch (error) {
    // handle error
    console.log("/notifications ERROR:", error);

    res.status(500).json({
      message: "/notifications error occurred",
    });
  }
});

app.post("/notifications", async (req, res, next) => {
  try {
    const { userId } = req.session;
    const exercise = req.body.exercise;
    const mmse = req.body.mmse;
    await notificationsCollection.updateOne(
      { userId },
      { $set: { exercise, mmse } }
    );

    res.status(200).json({ message: "Updated" });
  } catch (error) {
    res.status(500).json({ message: error?.message || "error" });
  }
});
// End of Notifications API

// validate user session before accessing daily recommendation page
// app.use("/dailyrecommendation", validateSession);

// get method for daily recommendation page
app.get("/dailyrecommendation", (req, res) => {
  res.render("dailyrecommendation");
});

// Meditation page
// verify the active session before allowing access to meditation page
app.use("/meditation", validateSession);
app.get("/meditation", (req, res) => {
  res.render("meditation");
});

// End of meditation API

// get method for 404 page
app.get("*", (req, res) => {
  res.status(404);
  res.render("404");
});

// Initialize the server
app.listen(port, () => {
  console.log(`Application is listening at http://localhost:${port}`);
});
