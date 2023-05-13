
require("./utils.js");

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const saltRounds = 12;

const port = process.env.PORT || 3000;
const number = 1

const app = express();

const Joi = require("joi");
const mongoSanitize = require('express-mongo-sanitize');
const { emit } = require("process");
const { type } = require("os");
const { getOrientationScore } = require("./public/scripts/mmse.js");
const expireTime = 60 * 60 * 1000; //expires after 1 hour  (minutes * seconds * millis)

/* secret information section */
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const node_session_secret = process.env.NODE_SESSION_SECRET;
/* END secret section */

const mmse = require('./public/scripts/mmse.js');

var { database } = include('databaseConnection');

const userCollection = database.db(mongodb_database).collection('users');

// file1.js
const myGlobalVar = "Hello, world!";

let userScore = 0;

module.exports = userScore;

let pageCount = 1;

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));

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

app.use(express.static("public"));


app.get('/', (req, res) => {
    res.redirect('/mmse-landing-page');
});

app.post('/', async (req, res) => {
    res.redirect('/mmse-landing-page');
});

app.get('/mmse-landing-page', (req, res) => {
    res.render("mmse-landing-page", { headerMessage: "MMSE Questionnaire" });
});

app.post('/mmse-landing-page', async (req, res) => {
    res.redirect('/mmse-orientation');
});

app.get('/mmse-orientation', (req, res) => {
    res.render("mmse-orientation.ejs", { headerMessage: "MMSE Questionnaire" });
});

app.post('/mmse-orientation', async (req, res) => {
    var year1 = req.body.year1;
    var year2 = req.body.year2;
    var year3 = req.body.year3;
    var year4 = req.body.year4;
    var month = req.body.month;
    var day = req.body.day;

    let result = year1 + year2 + year3 + year4 + month + day;

    userScore = userScore + await getOrientationScore(result);
    res.render("mmse-object-recall.ejs", { headerMessage: "MMSE Questionnaire", objectName: "scissors", pageCount: pageCount++ });
    console.log("userScore: " + userScore);
    return;
});

app.get('/mmse-object-recall', (req, res) => {
    res.render("mmse-object-recall.ejs", { headerMessage: "MMSE Questionnaire", objectName: "scissors", pageCount: pageCount++ });
});

app.post('/mmse-object-recall', async (req, res) => {
    if (pageCount <= 3) {
        res.redirect('/mmse-object-recall');
    } else {
        pageCount = 1;
        res.redirect('/mmse-sentence-recall');
    }
});

app.get('/mmse-sentence-recall', (req, res) => {
    res.render("mmse-sentence-recall.ejs", { headerMessage: "MMSE Questionnaire" });
});

app.post('/mmse-sentence-recall', async (req, res) => {
    res.redirect('/mmse-word-reversal');
});

app.get('/mmse-word-reversal', (req, res) => {
    res.render("mmse-word-reversal.ejs", { headerMessage: "MMSE Questionnaire", word: "hello", pageCount: pageCount++ });
});

app.post('/mmse-word-reversal', async (req, res) => {
    if (pageCount <= 3) {
        res.redirect('/mmse-word-reversal');
    } else {
        pageCount = 1;
        res.redirect('/mmse-results');
    }
});

app.get('/mmse-results', (req, res) => {
    res.render("mmse-results.ejs", { headerMessage: "MMSE Results" });
});

app.listen(port, () => {
    console.log("Node application listening on port " + port);
}); 