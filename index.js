
require("./utils.js");

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const saltRounds = 12;

const port = process.env.PORT || 3000;

const app = express();

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
    await userCollection.insertOne({
        username: username,
        email: email,
        password: hashedPassword,
    });

    console.log('Inserted user through signup');

    // redirect to the risk factory survey page
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

    // insert the user's risk factor survey results into the database
    await userCollection.insertOne({
        educationLevel: educationLevel,
        age: age,
        smoke: smoke,
        diabetes: diabetes,
        depression: depression,
    });

    console.log('Inserted user survey through signup');

    res.redirect('/surveyfinished');
});


app.get('/surveyfinished', (req, res) => {
    res.render('surveyfinished');
});

app.use(express.static(__dirname + "/public"));

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
