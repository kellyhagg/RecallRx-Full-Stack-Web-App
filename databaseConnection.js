// Description: This file contains the database connection information.
// Taken from COMP 2537 provided sample code.
// Author: Kelly Hagg
// Last modified: 2023-05-26

require('dotenv').config();

const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;

const MongoClient = require("mongodb").MongoClient;
const atlasURI = `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/?retryWrites=true`;
var database = new MongoClient(atlasURI, { useNewUrlParser: true, useUnifiedTopology: true });
module.exports = { database };