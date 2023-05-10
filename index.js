
require("./utils.js");

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const saltRounds = 12;

const port = process.env.PORT || 3000;

const app = express();
app.use(express.static("public"));

const Joi = require("joi");
const mongoSanitize = require('express-mongo-sanitize');
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

var { database } = include('databaseConnection');

const userCollection = database.db(mongodb_database).collection('users');


app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));

app.use(mongoSanitize(
    //{replaceWith: '%'}
));

// app.use(
//     mongoSanitize({
//       onSanitize: ({ req, key }) => {
//         console.warn(`This request[${key}] is sanitized`);
//       },
//     }),
//   );

var mongoStore = MongoStore.create({
    mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/sessions`,
    crypto: {
        secret: mongodb_session_secret
    }
})

app.use(session({
    secret: node_session_secret,
    store: mongoStore, //default is memory store 
    saveUninitialized: false,
    resave: true
}
));

app.get('/', (req, res) => {
    res.render("settings");
});

// Settings routes
app.get('/settings', (req, res) => {
    console.log("settings");
    res.render("settings");
});

// User information update routes 
app.get("/user-name-edit", (req, res) => { 
    res.render("user-name-edit");
});

// app.post("/update-user-name/:userId", (req, res) => {
app.post("/update-user-name", (req, res) => {
    // add db update 
    console.log("redirect to settings")
    res.redirect("settings");
});

app.get("/email-edit", (req, res) => { 
    console.log("email-edit");
    res.render("email-edit");
});

app.post("/update-email/:userId", (req, res) => {
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