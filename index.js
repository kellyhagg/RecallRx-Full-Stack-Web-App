

require("./utils.js");

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const saltRounds = 12;
const ObjectId = require('mongodb').ObjectId;

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
    res.render("index");
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

// post method for signup
app.post('/signup', async (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    // validate the input style for username, email and password using Joi
    const schema = Joi.object({
        username: Joi.string().alphanum().max(20).required(),
        email: Joi.string().max(20).required(),
        password: Joi.string().max(20).required(),
    });

    // validate the input
    const validationResult = schema.validate({ username, email, password });
    if (validationResult.error != null) {
        console.log(validationResult.error);
        res.redirect('/signup');
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

    console.log('Inserted user through signup');

    // store the user ID in the session
    req.session.userId = result.insertedId;

    // redirect to the risk factor survey page
    res.redirect('/riskfactorsurvey');
});


app.get('/logout', (req, res) => {
    // kills the session when users click logout
    req.session.destroy();
    res.render("logout");
});

app.get('/riskfactorsurvey', (req, res) => {
    res.render('riskfactorsurvey');
});

app.get('/riskfactorquestions', (req, res) => {
    res.render('riskfactorquestions');
});
// post method for risk factor survey
app.post('/riskfactorquestions', async (req, res) => {
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
    const validationResult = schema.validate({ educationLevel, age, smoke, diabetes, depression });
    if (validationResult.error != null) {
        console.log(validationResult.error);
        res.redirect('/riskfactorquestions');
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
            }
        }
    );

    console.log('Inserted user survey');

    res.redirect('/surveyfinished');
});


app.get('/surveyfinished', (req, res) => {
    res.render('surveyfinished');
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

app.use(express.static(__dirname + "/public"));

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 
