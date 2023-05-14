// Import necessary modules and packages
require("./utils.js");

require("dotenv").config();
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");

const MongoStore = require("connect-mongo");
const bcrypt = require("bcrypt");
const saltRounds = 12;
const ObjectId = require("mongodb").ObjectId;

// Set up the port number to listen on
const port = process.env.PORT || 3000;

// Create the Express application
const app = express();

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

app.use(express.urlencoded({ extended: false }));

app.use(
  mongoSanitize()
  //{replaceWith: '%'}
);

// app.use(
//     mongoSanitize({
//       onSanitize: ({ req, key }) => {
//         console.warn(`This request[${key}] is sanitized`);
//       },
//     }),
//   );

app.use(bodyParser.urlencoded({ extended: true }));

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

app.post("/", (req, res) => {
  res.redirect("/");
});


app.get("/signup", (req, res) => {
  res.render("signup");
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
    res.redirect("/signup");
    return;
  }

  // hash the password
  const hashedPassword = await bcrypt.hash(password, saltRounds);

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
  });

  console.log("Inserted user through signup");

  // store the user ID in the session
  req.session.userId = result.insertedId;
  // set authenticated to true
  req.session.authenticated = true;

  // redirect to the risk factor survey page
  res.redirect("/riskfactorsurvey");
});

app.get("/homepage", (req, res) => {
  res.render("homepage");
});

app.get("/logout", (req, res) => {
  // kills the session when users click logout
  req.session.destroy();
  res.render("logout");
});

app.get("/riskfactorsurvey", (req, res) => {
  res.render("riskfactorsurvey");
});

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

  res.redirect("/surveyfinished");
});

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
  var score = parseInt(Math.round((userScore / 18) * 100));
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
    .project({ username: 1, email: 1, password: 1, is_admin: 1, _id: 1 })
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
    req.session.username = username;
    req.session.email = user[0].email;
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

app.get("*", (req, res) => {
  res.status(404);
  res.render("404");
});


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
    email: Joi.string().max(20).required(),
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
  const link = `http://localhost:3000/reset-password/${user[0]._id}&auth=${token}`;
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

app.listen(port, () => {
  console.log(`Application is listening at http://localhost:${port}`);
});
