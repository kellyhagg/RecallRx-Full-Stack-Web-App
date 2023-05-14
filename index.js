// Import necessary modules and packages
require("./utils.js");

require("dotenv").config();
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");

const MongoStore = require("connect-mongo");
const bcrypt = require("bcrypt");
const saltRounds = 12;
// const ObjectId = require("mongodb").ObjectId;
const { ObjectId } = require("mongodb");

// Set up the port number to listen on
const port = process.env.PORT || 3000;

// Create the Express application
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
const {
  getObject,
  getSentence,
  getSentenceScore,
  getOrientationScore,
  getObjectScore,
  getWord,
  getReversalScore,
} = require("./public/scripts/mmse.js");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const fs = require("fs");
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
// Set up the view engine and static files
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());

// Connect to the database
var { database } = include("databaseConnection");
const userCollection = database.db(mongodb_database).collection("users");

// __NEW__
const notificationsCollection = database
  .db(mongodb_database)
  .collection("notifications");

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

app.get("/", (req, res) => {
  if (isValidSession(req)) {
    res.redirect("/homepage");
  } else {
    res.render("index");
  }
});
// post method for signup
app.post("/signup", async (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
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

  // store the user ID in the session
  req.session.userId = result.insertedId;
  // set authenticated to true
  req.session.authenticated = true;

  // redirect to the risk factor survey page
  res.redirect("/riskfactorsurvey");
});

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

app.get("*", (req, res) => {
  res.status(404);
  res.render("404");
});

app.listen(port, () => {
  console.log(`Application is listening at http://localhost:${port}`);
});
