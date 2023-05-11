//This code was modified from Emma Lee's COMP 2537 Assignment 2 

require("./utils.js");

const url = require('url');

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const ObjectId = require('mongodb').ObjectId;
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const saltRounds = 12;
const port = process.env.PORT || 4000;

const app = express();

const Joi = require("joi");

/* secret information section */
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;

console.log(mongodb_password)
console.log(mongodb_user)
const node_session_secret = process.env.NODE_SESSION_SECRET;
/* END secret section */

var { database } = include('databaseConnection');

const userCollection = database.db(mongodb_database).collection('users');

app.set('view engine', 'ejs');

//req.body need this to parse (app.post) ex. req.body.username
app.use(express.urlencoded({ extended: false }));

// initially was /session, now /test in mongoURL
var mongoStore = MongoStore.create({
    mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/test`,
    // mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/test`,
    crypto: {
        secret: mongodb_session_secret
    }
})


//handles cookies. Ex. req.session.cookies. **would have to parse cookies ourselves otherwise.  
app.use(session({
    secret: node_session_secret,
    store: mongoStore, //default is memory store 
    saveUninitialized: false,
    resave: true
}
));


//AUTHENTICATION
function isValidSession(req) {
    if (req.session.authenticated) {
        return true;
    }
    return false;
}

//session validation
function sessionValidation(req, res, next) {
    //if valid session call next action
    if (isValidSession(req)) {
        next();
    }
    //otherwise don't render and redirect to login
    else {
        res.redirect("login.ejs");
    }
}

app.use('/loggedin', sessionValidation);
app.get('/loggedin', (req, res) => {
    if (!req.session.authenticated) {
        res.redirect('/login.ejs');
    }
    res.render("loggedin.ejs");
});


app.get('/', (req, res) => {
    console.log(req.url);
    console.log(url.parse(req.url));
    res.render("login");
});

app.get('/login', (req, res) => {
    //Do wherever you want here like fetching data and show from the previous form.
    res.render('login');
});

app.get('/email', (req, res) => {
    //Do wherever you want here like fetching data and show from the previous form.
    res.render('email');
});

app.get('/logoutuser', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen(port, () => {
    console.log("Node application listening on port " + port);
});

