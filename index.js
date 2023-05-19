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
const ss = require("simple-statistics"); // import simple-statistics
const {
  runAlgorithm,
  train,
} = require("./public/scripts/recommendations_algorithm.js"); // import recommendations_algorithm.js
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
const { format } = require("path");
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
const mmseScoresCollection = database
  .db(mongodb_database)
  .collection("mmseScores"); // get the mmseScores collection
const resultsCorrelationData = database
  .db(mongodb_database)
  .collection("resultsCorrelationData"); // get the resultsCorrelationData collection
const resultsCorrelationValues = database
  .db(mongodb_database)
  .collection("resultsCorrelationValues"); // get the resultsCorrelationData collection
const dailyRecommendationLastVisit = database
  .db(mongodb_database)
  .collection("dailyRecommendationLastVisit"); // get the dailyRecommendationLastVisit collection

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
var retrievedObjects = [];
var retrievedObjects = [];
var retrievedWords = [];

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
    obesity: null,
    diabetes: null,
    depression: null,
    wasEasterEggAnnounced: false,
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
      wasNotificationClosed: false,
    },
    mmse: {
      frequency: "every-other-week", // default frequency
      isActive: true, // default enabled
      next: nextMMSENotification.toISOString(), // default next 2 weeks
      wasNotificationClosed: false,
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

async function showEasterEggAnnounced(userId, isEasterEggActivated) {
  const user = await userCollection.findOne(
    { _id: new ObjectId(userId) },
    { projection: { wasEasterEggAnnounced: 1 } }
  );
  const showPopUp = !user.wasEasterEggAnnounced;
  if (showPopUp && isEasterEggActivated) {
    return true;
  } else {
    return false;
  }
}

async function canShowCheckupNotification(userId) {
  console.log("userId: ", userId);
  const notification = await notificationsCollection.findOne(
    {
      userId: userId,
    },
    {
      projection: { mmse: 1, wasNotificationClosed: 1 },
    }
  );
  console.log("notification: ", notification);
  const currentDate = new Date().toISOString().slice(0, 10); // Get today's date
  var nextNotificationDate = notification.mmse.next;
  nextNotificationDate = nextNotificationDate.slice(0, 10);
  const showNotification = !notification.mmse.wasNotificationClosed;
  console.log("was closed?: ", notification.mmse.wasNotificationClosed);
  console.log("show?: ", showNotification);
  if (currentDate >= nextNotificationDate && showNotification) {
    console.log("show notification");
    return true;
  } else {
    console.log("do not show notification");
    return false;
  }
}

// Middleware to validate user session before accessing homepage
app.use("/homepage", validateSession);
// get method for homepage
app.get("/homepage", async (req, res) => {
  const showCheckupNotification = await canShowCheckupNotification(
    req.session.userId
  );
  console.log("Home: ", showCheckupNotification);

  var data = "";
  var isEasterEggActivated = await checkChallengeTrend(req.session.username);
  var showEasterEggPopup = await showEasterEggAnnounced(
    req.session.userId,
    isEasterEggActivated
  );
  console.log("showEasterEggPopup", showEasterEggPopup);
  if (showEasterEggPopup) {
    data = `You were doing great these last ${CHALLENGE_PERIOD} days. 
      So RecallRx team decided to add something special for you.`;
    await userCollection.updateOne(
      { _id: new ObjectId(req.session.userId) },
      { $set: { wasEasterEggAnnounced: true } }
    );
  }
  console.log("render home");
  res.render("homepage", {
    recommendation1: "alcohol",
    isEasterEggActivated: isEasterEggActivated,
    data: data,
    showPopUp: showEasterEggPopup,
    showCheckupNotification: showCheckupNotification,
  });
});

app.post("/checkup-toast-state-update", async (req, res) => {
  const userId = req.session.userId;
  var notification = await notificationsCollection.findOne(
    { userId: userId },
    { projection: { _id: 1 } }
  );
  const updatedNotification = await notificationsCollection.findOneAndUpdate(
    { _id: notification._id },
    { $set: { "mmse.wasNotificationClosed": true } },
    { returnOriginal: false }
  );
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
  const obesity = req.body.obesity;
  const diabetes = req.body.diabetes;
  const depression = req.body.depression;

  // validate the input style for educationLevel, age, obesity, diabetes and depression using Joi
  const schema = Joi.object({
    educationLevel: Joi.string().required(),
    age: Joi.string().required(),
    obesity: Joi.string().required(),
    diabetes: Joi.string().required(),
    depression: Joi.string().required(),
  });

  // validate the input
  const validationResult = schema.validate({
    educationLevel,
    age,
    obesity,
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
    { _id: userId },
    {
      $set: {
        educationLevel: educationLevel,
        age: age,
        obesity: obesity,
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
  retrievedObjects = [];
  retrievedWords = [];
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
  const object = getObject(retrievedObjects);
  retrievedObjects.push(object);
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
  const word = getWord(retrievedWords);
  retrievedWords.push(word);
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

app.get("/mmse-results", async (req, res) => {
  // const score = parseInt(Math.round((userScore / 15) * 100));
  const score = 90;
  const activityData = await activityCollection.find({}).toArray();
  var exercise = [];
  var social = [];
  var smoking = [];
  var alcohol = [];

  const previousMonth = new Date();
  previousMonth.setMonth(previousMonth.getMonth() - 1);
  const formattedDate = previousMonth.toISOString();
  const activities = await activityCollection.find({}).toArray();

  activities.forEach((activity) => {
    if (
      req.session.username == activity.username &&
      activity.date >= formattedDate
    ) {
      console.log(activity.exerciseDuration);
      exercise.push(activity.exerciseDuration);
      social.push(activity.socialDuration);
      smoking.push(activity.smokeAmount);
      alcohol.push(activity.alcoholAmount);
    }
  });

  const exerciseAvg = exercise.reduce((a, b) => a + b, 0) / exercise.length;
  const socialAvg = social.reduce((a, b) => a + b, 0) / social.length;
  const smokingAvg = smoking.reduce((a, b) => a + b, 0) / smoking.length;
  const alcoholAvg = alcohol.reduce((a, b) => a + b, 0) / alcohol.length;

  await resultsCorrelationData.insertOne({
    exerciseAvg: exerciseAvg,
    socialAvg: socialAvg,
    smokingAvg: smokingAvg,
    alcoholAvg: alcoholAvg,
    score: score,
  });

  try {
    const username = req.session.username;
    const currentDate = new Date().toISOString().slice(0, 10); // Get today's date

    // Find a document with the current username and today's date
    const user = await mmseScoresCollection.insertOne({
      username: username,
      date: currentDate,
      // score: score,
      score: 90,
    });
  } catch (error) {
    console.error("Error retrieving user data:", error);
  }

  // const randomNumber1to100 = Math.floor(Math.random() * 100) + 1;
  const randomNumber1to100 = 1;

  // const dataset = [
  //   { exerciseAvg: 40, socialAvg: 50, smokingAvg: 0, alcoholAvg: 2, score: 85 },
  //   { exerciseAvg: 20, socialAvg: 50, smokingAvg: 4, alcoholAvg: 4, score: 70 },
  //   { exerciseAvg: 60, socialAvg: 90, smokingAvg: 2, alcoholAvg: 1, score: 95 },
  //   { exerciseAvg: 30, socialAvg: 60, smokingAvg: 0, alcoholAvg: 3, score: 75 },
  //   { exerciseAvg: 50, socialAvg: 80, smokingAvg: 2, alcoholAvg: 2, score: 80 },
  //   { exerciseAvg: 10, socialAvg: 40, smokingAvg: 4, alcoholAvg: 4, score: 65 },
  //   { exerciseAvg: 70, socialAvg: 100, smokingAvg: 0, alcoholAvg: 1, score: 95 },
  //   { exerciseAvg: 40, socialAvg: 70, smokingAvg: 1, alcoholAvg: 3, score: 85 },
  //   { exerciseAvg: 20, socialAvg: 50, smokingAvg: 4, alcoholAvg: 4, score: 70 },
  //   { exerciseAvg: 60, socialAvg: 90, smokingAvg: 0, alcoholAvg: 2, score: 100 }
  // ];

  // dataset.forEach(async (data) => {
  //   await resultsCorrelationData.insertOne(data);
  // });

  if (randomNumber1to100 == 1) {
    console.log("Training model");
    var updatedCorrelationValues = [];
    const result = await resultsCorrelationData.find({}).toArray();
    updatedCorrelationValues = await train(result);
    console.log(updatedCorrelationValues[0]);

    console.log(updatedCorrelationValues);
    await resultsCorrelationValues.deleteMany({});
    await resultsCorrelationValues.insertOne({
      exerciseCorrelation: updatedCorrelationValues[0],
      socialCorrelation: updatedCorrelationValues[1],
      smokingCorrelation: -updatedCorrelationValues[2],
      alcoholCorrelation: -updatedCorrelationValues[3],
    });
  }

  res.render("mmse-results.ejs", {
    headerMessage: "MMSE Results",
    score: score,
  });
  userScore = 0;
});

async function defineNextMmseDate(userId) {
  const currentDate = new Date();
  var notification = await notificationsCollection.findOne(
    { userId: userId },
    { projection: { mmse: 1 } }
  );
  const frequency = notification.mmse.frequency;
  const isActive = notification.mmse.active;
  var numberOfDays = 7;
  switch (frequency) {
    case "every-other-week":
      numberOfDays = 14;
      break;
    case "monthly":
      numberOfDays = 30;
  }
  console.log("current date: ", currentDate);
  const newNextDate = new Date();
  newNextDate.setDate(currentDate.getDate() + numberOfDays);
  console.log("next: ", newNextDate);
  console.log("next: ", newNextDate.toISOString());
  console.log("user id: ", userId);
  if (isActive) {
    const updatedNotification = await notificationsCollection.findOneAndUpdate(
      { userId: userId },
      { $set: { "mmse.next": newNextDate.toISOString() } },
      { returnOriginal: false }
    );
  }
}

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
      "Your reset password link for RecallRx was sent. Please check your email.",
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
app.use("/dailyrecommendation", validateSession);

async function getRecommendation(req, res) {
  var lastRecommendation;
  var dailyRecommendation;

  if (
    (await dailyRecommendationLastVisit.findOne(
      { username: req.session.username },
      { projection: { date: 1 } }
    )) == null
  ) {
    console.log("no last visit");
    lastRecommendation = new Date().toISOString().slice(0, 10);
    await dailyRecommendationLastVisit.insertOne({
      username: req.session.username,
      date: lastRecommendation,
    });
  } else {
    console.log("last visit");
    lastRecommendation = (
      await dailyRecommendationLastVisit.findOne(
        { username: req.session.username },
        { projection: { date: 1 } }
      )
    ).date; // Access the "date" field of the found document
  }

  const currentDate = new Date().toISOString().slice(0, 10); // Get current day
  console.log(lastRecommendation != currentDate);

  if (lastRecommendation == currentDate) {
    console.log("new day");
    lastRecommendation = currentDate; // Update lastRecommendation with currentDate

    await dailyRecommendationLastVisit.updateOne(
      { username: req.session.username },
      { $set: { date: currentDate } }
    );

    var exercise = [];
    var social = [];
    var smoking = [];
    var alcohol = [];

    var values = [];
    var coefficients = [];

    var recommendation1;
    var recommendation2;

    const previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    const formattedDate = previousMonth.toISOString();

    const activities = await activityCollection.find({}).toArray();

    activities.forEach((activity) => {
      if (
        req.session.username == activity.username &&
        activity.date >= formattedDate
      ) {
        exercise.push(activity.exerciseDuration);
        social.push(activity.socialDuration);
        smoking.push(activity.smokeAmount);
        alcohol.push(activity.alcoholAmount);
      }
    });

    const correlations = await resultsCorrelationValues.find({}).toArray();

    correlations.forEach((result) => {
      coefficients.push(result.exerciseCorrelation);
      coefficients.push(result.socialCorrelation);
      coefficients.push(result.smokingCorrelation);
      coefficients.push(result.alcoholCorrelation);
    });

    const exerciseAvg = exercise.reduce((a, b) => a + b, 0) / exercise.length;
    const socialAvg = social.reduce((a, b) => a + b, 0) / social.length;
    const smokingAvg = smoking.reduce((a, b) => a + b, 0) / smoking.length;
    const alcoholAvg = alcohol.reduce((a, b) => a + b, 0) / alcohol.length;

    values.push(exerciseAvg);
    values.push(socialAvg);
    values.push(smokingAvg);
    values.push(alcoholAvg);

    console.log(coefficients);

    const dailyRecommendations = await runAlgorithm(values, coefficients);

    recommendation1 = dailyRecommendations[0];
    recommendation2 = dailyRecommendations[1];

    await dailyRecommendationLastVisit.updateOne(
      {
        username: req.session.username,
      },
      {
        $set: {
          recommendation1: recommendation1,
          recommendation2: recommendation2,
        },
      },
      { upsert: true }
    );
  } else {
    console.log("same day");
    recommendation1 = (
      await dailyRecommendationLastVisit.findOne(
        { username: req.session.username },
        { projection: { recommendation1: 1 } }
      )
    ).recommendation1; // Access the "recommendation1" field of the found document

    recommendation2 = (
      await dailyRecommendationLastVisit.findOne(
        { username: req.session.username },
        { projection: { recommendation2: 1 } }
      )
    ).recommendation2; // Access the "recommendation2" field of the found document
  }

  return [recommendation1, recommendation2];
}

async function getWeeklyAverages(req, res) {
  var exerciseAvgWeek1 = [];
  var exerciseAvgWeek2 = [];
  var exerciseAvgWeek3 = [];
  var exerciseAvgWeek4 = [];
  var socialAvgWeek1 = [];
  var socialAvgWeek2 = [];
  var socialAvgWeek3 = [];
  var socialAvgWeek4 = [];
  var smokingAvgWeek1 = [];
  var smokingAvgWeek2 = [];
  var smokingAvgWeek3 = [];
  var smokingAvgWeek4 = [];
  var alcoholAvgWeek1 = [];
  var alcoholAvgWeek2 = [];
  var alcoholAvgWeek3 = [];
  var alcoholAvgWeek4 = [];

  const currentDay = new Date().toISOString().slice(0, 10);

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const formatOneWeekAgo = oneWeekAgo.toISOString().slice(0, 10);
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const formatTwoWeeksAgo = twoWeeksAgo.toISOString().slice(0, 10);
  const threeWeeksAgo = new Date();
  threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);
  const formatThreeWeeksAgo = threeWeeksAgo.toISOString().slice(0, 10);
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
  const formatFourWeeksAgo = fourWeeksAgo.toISOString().slice(0, 10);

  const activities = await activityCollection.find({}).toArray();
  activities.forEach((activity) => {
    if (
      req.session.username == activity.username &&
      activity.date <= currentDay &&
      activity.date > formatOneWeekAgo
    ) {
      exerciseAvgWeek4.push(activity.exerciseDuration);
      socialAvgWeek4.push(activity.socialDuration);
      smokingAvgWeek4.push(activity.smokeAmount);
      alcoholAvgWeek4.push(activity.alcoholAmount);
    }
  });

  exerciseAvgWeek4 =
    exerciseAvgWeek4.reduce((a, b) => a + b, 0) / exerciseAvgWeek4.length;
  socialAvgWeek4 =
    socialAvgWeek4.reduce((a, b) => a + b, 0) / socialAvgWeek4.length;
  smokingAvgWeek4 =
    smokingAvgWeek4.reduce((a, b) => a + b, 0) / smokingAvgWeek4.length;
  alcoholAvgWeek4 =
    alcoholAvgWeek4.reduce((a, b) => a + b, 0) / alcoholAvgWeek4.length;

  activities.forEach((activity) => {
    if (
      req.session.username == activity.username &&
      activity.date <= formatOneWeekAgo &&
      activity.date > formatTwoWeeksAgo
    ) {
      exerciseAvgWeek3.push(activity.exerciseDuration);
      socialAvgWeek3.push(activity.socialDuration);
      smokingAvgWeek3.push(activity.smokeAmount);
      alcoholAvgWeek3.push(activity.alcoholAmount);
    }
  });

  exerciseAvgWeek3 =
    exerciseAvgWeek3.reduce((a, b) => a + b, 0) / exerciseAvgWeek3.length;
  socialAvgWeek3 =
    socialAvgWeek3.reduce((a, b) => a + b, 0) / socialAvgWeek3.length;
  smokingAvgWeek3 =
    smokingAvgWeek3.reduce((a, b) => a + b, 0) / smokingAvgWeek3.length;
  alcoholAvgWeek3 =
    alcoholAvgWeek3.reduce((a, b) => a + b, 0) / alcoholAvgWeek3.length;

  activities.forEach((activity) => {
    if (
      req.session.username == activity.username &&
      activity.date <= formatTwoWeeksAgo &&
      activity.date > formatThreeWeeksAgo
    ) {
      exerciseAvgWeek2.push(activity.exerciseDuration);
      socialAvgWeek2.push(activity.socialDuration);
      smokingAvgWeek2.push(activity.smokeAmount);
      alcoholAvgWeek2.push(activity.alcoholAmount);
    }
  });

  exerciseAvgWeek2 =
    exerciseAvgWeek2.reduce((a, b) => a + b, 0) / exerciseAvgWeek2.length;
  socialAvgWeek2 =
    socialAvgWeek2.reduce((a, b) => a + b, 0) / socialAvgWeek2.length;
  smokingAvgWeek2 =
    smokingAvgWeek2.reduce((a, b) => a + b, 0) / smokingAvgWeek2.length;
  alcoholAvgWeek2 =
    alcoholAvgWeek2.reduce((a, b) => a + b, 0) / alcoholAvgWeek2.length;

  activities.forEach((activity) => {
    if (
      req.session.username == activity.username &&
      activity.date <= formatThreeWeeksAgo &&
      activity.date > formatFourWeeksAgo
    ) {
      exerciseAvgWeek1.push(activity.exerciseDuration);
      socialAvgWeek1.push(activity.socialDuration);
      smokingAvgWeek1.push(activity.smokeAmount);
      alcoholAvgWeek1.push(activity.alcoholAmount);
    }
  });

  exerciseAvgWeek1 =
    exerciseAvgWeek1.reduce((a, b) => a + b, 0) / exerciseAvgWeek1.length;
  socialAvgWeek1 =
    socialAvgWeek1.reduce((a, b) => a + b, 0) / socialAvgWeek1.length;
  smokingAvgWeek1 =
    smokingAvgWeek1.reduce((a, b) => a + b, 0) / smokingAvgWeek1.length;
  alcoholAvgWeek1 =
    alcoholAvgWeek1.reduce((a, b) => a + b, 0) / alcoholAvgWeek1.length;

  exerciseAvg = [
    exerciseAvgWeek1,
    exerciseAvgWeek2,
    exerciseAvgWeek3,
    exerciseAvgWeek4,
  ];
  socialAvg = [socialAvgWeek1, socialAvgWeek2, socialAvgWeek3, socialAvgWeek4];
  smokingAvg = [
    smokingAvgWeek1,
    smokingAvgWeek2,
    smokingAvgWeek3,
    smokingAvgWeek4,
  ];
  alcoholAvg = [
    alcoholAvgWeek1,
    alcoholAvgWeek2,
    alcoholAvgWeek3,
    alcoholAvgWeek4,
  ];

  return [exerciseAvg, socialAvg, smokingAvg, alcoholAvg];
}

// get method for daily recommendation page
app.get("/dailyrecommendation", async (req, res) => {
  var dailyRecommendations = await getRecommendation(req, res);
  var recommendation1 = dailyRecommendations[0];
  var recommendation2 = dailyRecommendations[1];

  const weeklyAverages = await getWeeklyAverages(req, res);

  res.render("dailyrecommendation", {
    recommendation1: recommendation1,
    recommendation2: recommendation2,
    exerciseAvg: weeklyAverages[0],
    socialAvg: weeklyAverages[1],
    smokingAvg: weeklyAverages[2],
    alcoholAvg: weeklyAverages[3],
  });
});

// validate user session before accessing daily activity tracking page
app.use("/daily-activity-tracking", validateSession);

// get method for daily activity tracking page
app.get("/daily-activity-tracking", async (req, res) => {
  try {
    const username = req.session.username;
    const currentDate = new Date().toISOString().slice(0, 10); // Get today's date

    // Find a document with the current username and today's date
    const user = await activityCollection.findOne(
      {
        username: username,
        date: currentDate,
      },
      {
        projection: {
          exerciseDuration: 1,
          socialDuration: 1,
          alcoholAmount: 1,
          smokeAmount: 1,
        },
      }
    );

    let exerciseDuration, socialDuration, alcoholAmount, smokeAmount;

    if (user) {
      // Data exists in the database, use the retrieved values
      exerciseDuration = user.exerciseDuration;
      socialDuration = user.socialDuration;
      alcoholAmount = user.alcoholAmount;
      smokeAmount = user.smokeAmount;
    } else {
      // Data doesn't exist in the database, set default values
      exerciseDuration = 0;
      socialDuration = 0;
      alcoholAmount = 0;
      smokeAmount = 0;
    }

    console.log("Exercise Time:", exerciseDuration);
    console.log("Social Time:", socialDuration);
    console.log("Alcohol Consumption:", alcoholAmount);
    console.log("Smoke Count:", smokeAmount);

    // Calculate the progress ratios based on the retrieved data
    const exerciseProgressRatio = exerciseDuration
      ? exerciseDuration / EXERCISE_TIME_GOAL
      : 0;
    const socialProgressRatio = socialDuration
      ? socialDuration / SOCIAL_TIME_GOAL
      : 0;
    const alcoholProgressRatio = alcoholAmount
      ? alcoholAmount / ALCOHOL_CONSUMPTION_LIMIT
      : 0;
    const smokeProgressRatio = smokeAmount
      ? smokeAmount / SMOKE_COUNT_LIMIT
      : 0;
    const exerciseMinLeft = EXERCISE_TIME_GOAL - exerciseDuration;
    const socialMinLeft = SOCIAL_TIME_GOAL - socialDuration;
    const alcoholLeft = ALCOHOL_CONSUMPTION_LIMIT - alcoholAmount;
    const smokeLeft = SMOKE_COUNT_LIMIT - smokeAmount;
    const isExerciseGoalReached = exerciseMinLeft <= 0;
    const isSocialGoalReached = socialMinLeft <= 0;
    const isAlcoholGoalReached = alcoholLeft <= 0;
    const isSmokeGoalReached = smokeLeft <= 0;

    // Render the EJS template with the updated progress ratios
    res.render("daily-activity-tracking", {
      exerciseProgressRatio: exerciseProgressRatio,
      socialProgressRatio: socialProgressRatio,
      alcoholProgressRatio: alcoholProgressRatio,
      smokeProgressRatio: smokeProgressRatio,
      exerciseMinLeft: exerciseMinLeft,
      socialMinLeft: socialMinLeft,
      alcoholLeft: alcoholLeft,
      smokeLeft: smokeLeft,
      isExerciseGoalReached: isExerciseGoalReached,
      isSocialGoalReached: isSocialGoalReached,
      isAlcoholGoalReached: isAlcoholGoalReached,
      isSmokeGoalReached: isSmokeGoalReached,
    });
  } catch (error) {
    console.error("Error retrieving user data:", error);
  }
});

function isUserOnTrack(
  exerciseDuration,
  socialDuration,
  alcoholAmount,
  smokeAmount
) {
  if (
    exerciseDuration <= EXERCISE_TIME_GOAL ||
    socialDuration <= SOCIAL_TIME_GOAL ||
    alcoholAmount >= ALCOHOL_CONSUMPTION_LIMIT ||
    smokeAmount >= SMOKE_COUNT_LIMIT
  ) {
    return false;
  }
  return true;
}

app.post("/daily-activity-tracking", async (req, res) => {
  try {
    const username = req.session.username;
    const currentDate = new Date().toISOString().slice(0, 10); // Get today's date

    // Extract the variables from the req.body object
    let { exerciseDuration, socialDuration, alcoholAmount, smokeAmount } =
      req.body;

    console.log("Received exerciseDuration:", exerciseDuration);
    console.log("Received socialDuration:", socialDuration);
    console.log("Received alcoholAmount:", alcoholAmount);
    console.log("Received smokeAmount:", smokeAmount);

    // Parse the values as floats and fallback to 0 if they are NaN
    exerciseDuration = parseFloat(exerciseDuration) || 0;
    socialDuration = parseFloat(socialDuration) || 0;
    alcoholAmount = parseFloat(alcoholAmount) || 0;
    smokeAmount = parseFloat(smokeAmount) || 0;
    const isOnTrack = isUserOnTrack(
      exerciseDuration,
      socialDuration,
      alcoholAmount,
      smokeAmount
    );

    // Find a document with the current username and today's date
    const existingDocument = await activityCollection.findOne({
      username: username,
      date: currentDate,
    });

    console.log("found:" + username + currentDate);

    if (existingDocument) {
      // Document exists, update all the fields by adding the new values to the existing values
      const updatedExerciseDuration =
        existingDocument.exerciseDuration + parseFloat(exerciseDuration);
      const updatedSocialDuration =
        existingDocument.socialDuration + parseFloat(socialDuration);
      const updatedAlcoholAmount =
        existingDocument.alcoholAmount + parseFloat(alcoholAmount);
      const updatedSmokeAmount =
        existingDocument.smokeAmount + parseFloat(smokeAmount);
      const isOnTrack = isUserOnTrack(
        updatedExerciseDuration,
        updatedSocialDuration,
        updatedAlcoholAmount,
        updatedSmokeAmount
      );

      console.log("Existing document:", existingDocument);
      console.log("Existing document ID:", existingDocument._id);

      await activityCollection.updateOne(
        { _id: existingDocument._id },
        {
          $set: {
            exerciseDuration: updatedExerciseDuration,
            socialDuration: updatedSocialDuration,
            alcoholAmount: updatedAlcoholAmount,
            smokeAmount: updatedSmokeAmount,
            isOnTrack: isOnTrack,
          },
        }
      );
      console.log("Today's activity updated");
      console.log("updatedExerciseDuration:" + updatedExerciseDuration);
      console.log("updatedSocialDuration:" + updatedSocialDuration);
      console.log("updatedAlcoholAmount:" + updatedAlcoholAmount);
      console.log("updatedSmokeAmount:" + updatedSmokeAmount);
    } else {
      // Document does not exist, create a new one
      await activityCollection.insertOne({
        username: username,
        date: currentDate,
        exerciseDuration: exerciseDuration,
        socialDuration: socialDuration,
        alcoholAmount: alcoholAmount,
        smokeAmount: smokeAmount,
        isOnTrack: isOnTrack,
      });
      console.log("Today's activity created");
    }
  } catch (error) {
    console.log(error);
  }

  res.redirect("/daily-activity-tracking");
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
