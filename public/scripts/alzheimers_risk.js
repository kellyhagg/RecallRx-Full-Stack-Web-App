// Calculate the risk of dementia based on the survey results and Kaggle dataset analysis
// Author: Kelly Hagg
// Last modified: 2023-05-26

// Include necessary libraries
const fs = require('fs');
const csv = require('csv-parser');
const ss = require('simple-statistics');

// Create an array to store the results
var results = [];

// Create variables to store the regression values
var ageSlope = 0;
var ageIntercept = 0;

var sexSlope = 0;
var sexIntercept = 0;

var eduSlope = 0;
var eduIntercept = 0;

// Run the analysis on the Kaggle dataset
// source: https://www.kaggle.com/datasets/brsdincer/alzheimer-features
async function runAnalysis
    () {
    // Function made and debugged with the assistance of ChatGPT
    return new Promise((resolve, reject) => {
        // Read the csv file, and extract the ages, groups as 0 or 1 and sex as 0 or 1
        fs.createReadStream('public/resources/alzheimer.csv')
            .pipe(csv())
            .on('data', (data) => {
                if (data.Group !== 'Converted') {
                    const [sex1, sex2] = data['M/F'].split('/');
                    const sex = sex1.trim() || sex2.trim(); // Choose the non-empty value
                    results.push({
                        Age: Number(data.Age),
                        // Set the group to 0 if Nondemented, and 1 if Demented
                        Group: data.Group === 'Nondemented' ? 0 : 1,
                        // Set the group to 0 if Female, and 1 if Male
                        Sex: sex === 'F' ? 0 : 1,
                        Edu: Number(data.EDUC)
                    });
                }
            })
            .on('end', () => {
                const data = results;
                // Extract all ages
                const ages = data.map((data) => data.Age);
                // Extract all genders
                const sexes = data.map((data) => data.Sex);
                // Extract all education levels
                const edu = data.map((data) => data.Edu);
                // Extract all groups
                const groups = data.map((data) => data.Group);

                // Find the ratio of dementia to total participants from this dataset
                const numWithDementia = groups.reduce((count, group) => count + group, 0);
                const totalParticipants = groups.length;
                const dementiaRatio = numWithDementia / totalParticipants;

                // Map the data for use in the linear regression function
                const sexData = groups.map((group, index) => [group, sexes[index]]);
                const eduData = groups.map((group, index) => [group, edu[index]]);

                // Run the linear regression function
                const ageRegression = ss.linearRegression([ages, groups]);
                const sexRegression = ss.linearRegression(sexData);
                const eduRegression = ss.linearRegression(eduData);

                // Extract the slope and intercept values from the regression
                ageSlope = ageRegression.m;
                ageIntercept = ageRegression.b;

                console.log("ageSlope: " + ageSlope);
                console.log("ageIntercept: " + ageIntercept);

                sexSlope = sexRegression.m;
                sexIntercept = sexRegression.b;

                console.log("sexSlope: " + sexSlope);
                console.log("sexIntercept: " + sexIntercept);

                eduSlope = eduRegression.m;
                eduIntercept = eduRegression.b;

                console.log("eduSlope: " + eduSlope);
                console.log("eduIntercept: " + eduIntercept);

                // Return the regression values
                resolve([sexSlope, sexIntercept, eduSlope, eduIntercept, ageSlope, ageIntercept, dementiaRatio]);
            });
    });
}

// Calculate the risk of dementia based on the survey results and Kaggle dataset analysis
async function calculateRisk(age, gender, educationLevel) {
    // Run the analysis on the Kaggle dataset for comparison
    const results = await runAnalysis();
    // Get constant for global dementia prevelance
    // https://www.alzint.org/about/dementia-facts-figures/dementia-statistics/
    const dementiaPrevelance = 55000000 / 8034000000;
    // Get constant to adjust for dataset applying strictly to alzheimers (70% of dementia cases)
    // https://www.cdc.gov/aging/dementia/index.html#:~:text=Alzheimer's%20disease.,specific%20changes%20in%20the%20brain
    const percentOfDementiaBeingAlzheimers = 0.7;

    // Adjust the age to the nearest age group
    if (age == 'lessThan65') {
        age = 64;
    } else if (age == '65-69') {
        age = 67;
    } else if (age == '70-75') {
        age = 72;
    } else if (age == '76-80') {
        age = 78;
    } else if (age == '81-85') {
        age = 83;
    } else if (age == 'Over85') {
        age = 90;
    }

    // Adjust the education level to a number
    if (educationLevel == 'lessThanSecondary') {
        educationLevel = 12;
    } else if (educationLevel == 'secondary') {
        educationLevel = 14;
    } else if (educationLevel == 'postSecondary') {
        educationLevel = 16;
    } else if (educationLevel == 'graduate') {
        educationLevel = 18;
    }

    console.log("age: " + age);
    console.log("gender: " + gender);
    console.log("educationLevel: " + educationLevel);

    var risk = 0;
    var ageRisk = 0;
    var sexRisk = 0;
    var eduRisk = 0;

    // Calculate the risk based on the regression values
    if (results[0] != 0) {
        if (gender == 'male') {
            sexRisk = results[0] * 1 + results[1];
        } else {
            sexRisk = results[0] * 0 + results[1];
        }
        risk += sexRisk;
    }
    if (results[2] != 0) {
        eduRisk = results[2] * educationLevel + results[3];
        risk += eduRisk;
    }
    if (results[4] != 0) {
        ageRisk = results[4] * age + results[5];
        risk += ageRisk;
    }

    // Adjust the risk based on the global dementia prevelance and the percent of dementia cases 
    // that are alzheimers
    const adjustedRisk = (risk * dementiaPrevelance / results[6]) / percentOfDementiaBeingAlzheimers;
    console.log("risk: " + risk);
    console.log("adjustedRisk: " + adjustedRisk);

    // Format the risk to 2 decimal places and return
    const formattedRisk = Math.round(adjustedRisk * 100) / 100;
    return formattedRisk;
}

// Export the function for use in index.js
module.exports = { calculateRisk };
