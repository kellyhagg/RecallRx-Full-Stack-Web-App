const fs = require('fs');
const csv = require('csv-parser');
const ss = require('simple-statistics');

const results = [];

var ages = [];
var groups = [];
var sexes = [];

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
            const [sex1, sex2] = data['M/F'].split('/');
            const sex = sex1.trim() || sex2.trim(); // Choose the non-empty value
            results.push({
                Age: Number(data.Age),
                Group: data.Group === 'Nondemented' ? 0 : 1,
                Sex: sex === 'F' ? 0 : 1,
                Edu: Number(data.EDUC)
            });
        }
    })
    .on('end', () => {
        // Extract all ages
        ages = results.map((data) => data.Age);
        // Extract all groups
        groups = results.map((data) => data.Group);
        // Extract all genders
        sexes = results.map((data) => data.Sex);
        // Extract all education levels
        edu = results.map((data) => data.Edu);

        console.log(ages);
        console.log(groups);
        console.log(sexes);
        console.log(edu);

        const ageRegression = ss.linearRegression([ages, groups]);
        const sexRegression = ss.linearRegression([sexes, groups]);
        const eduRegression = ss.linearRegression([edu, groups]);

        ageSlope = ageRegression.m;
        ageIntercept = ageRegression.b;

        sexSlope = sexRegression.m;
        sexIntercept = sexRegression.b;

        eduSlope = eduRegression.m;
        eduIntercept = eduRegression.b;
    });

