

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
const { getOrientationScore, getWord, getReversalScore } = require("./public/scripts/mmse.js");
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

var userScore = 0;

module.exports = userScore;

let pageCount = 1;

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));

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
    var year = req.body.year;
    var month = req.body.month;
    var day = req.body.day;

    userScore = userScore + getOrientationScore(year, month, day);
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

app.get('/mmse-word-reversal', async (req, res) => {
    var word = getWord();
    console.log("word: " + word);
    res.render("mmse-word-reversal.ejs", { headerMessage: "MMSE Questionnaire", word: word, pageCount: pageCount++ });
});

app.post('/mmse-word-reversal', async (req, res) => {
    const word = req.body.word;
    console.log(req.body);
    console.log("word in index: " + word);
    const inputWord = req.body.inputWord;
    userScore = userScore + getReversalScore(inputWord, word);
    console.log("userScore: " + userScore);

    if (pageCount <= 3) {
        res.redirect('/mmse-word-reversal');
    } else {
        pageCount = 1;
        res.redirect('/mmse-results');
    }
});

app.get('/mmse-results', (req, res) => {
    var score = parseInt(Math.round(userScore / 18 * 100));
    res.render("mmse-results.ejs", { headerMessage: "MMSE Results", score: score });
    userScore = 0;
});

app.listen(port, () => {
    console.log("Node application listening on port " + port);
}); 