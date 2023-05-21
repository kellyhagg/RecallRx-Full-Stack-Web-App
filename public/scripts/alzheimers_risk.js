const fs = require('fs');
const csv = require('csv-parser');
const ss = require('simple-statistics');

const results = [];

var ages = [];
var groups = [];

var ageSlope = 0;
var ageIntercept = 0;

var sexSlope = 0;
var sexIntercept = 0;

var eduSlope = 0;
var eduIntercept = 0;

// Provided with the assistance of ChatGPT
fs.createReadStream('public/resources/alzheimer.csv')
    .pipe(csv())
    .on('data', (data) => {
        if (data.Group !== 'Converted') {
            results.push({
                Age: Number(data.Age),
                Group: data.Group === 'Demented' ? 0 : 1,
            });
        }
    })
    .on('end', () => {
        // Extract all ages
        ages = results.map((data) => data.Age);
        // Extract all groups
        groups = results.map((data) => data.Group);

        console.log(ages);
        console.log(groups);

        const regression = ss.linearRegression([ages, groups]);

        ageSlope = regression.m;
        ageIntercept = regression.b;

        console.log(slope);
    });
