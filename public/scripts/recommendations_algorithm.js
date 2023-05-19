const fs = require('fs');
const path = require('path');

const ss = require('simple-statistics');

// Made with the assistance of ChatGPT - Calculates the correlation coefficients
async function train(dataset) {

    var values = [];
    // Extract the values for each variable
    const exerciseAvg = dataset.map(data => data.exerciseAvg);
    const socialAvg = dataset.map(data => data.socialAvg);
    const smokingAvg = dataset.map(data => data.smokingAvg);
    const alcoholAvg = dataset.map(data => data.alcoholAvg);
    const resultingScore = dataset.map(data => data.score);

    // Calculate the correlation coefficients
    const exerciseScoreCorrelation = ss.sampleCorrelation(exerciseAvg, resultingScore);
    const socialScoreCorrelation = ss.sampleCorrelation(socialAvg, resultingScore);
    const smokingScoreCorrelation = ss.sampleCorrelation(smokingAvg, resultingScore);
    const alcoholScoreCorrelation = ss.sampleCorrelation(alcoholAvg, resultingScore);

    // Print the correlation coefficients
    console.log("Exercise-Score Correlation: ", exerciseScoreCorrelation);
    console.log("Social-Score Correlation: ", socialScoreCorrelation);
    console.log("Smoking-Score Correlation: ", smokingScoreCorrelation);
    console.log("Alcohol-Score Correlation: ", alcoholScoreCorrelation);

    values.push(exerciseScoreCorrelation);
    values.push(socialScoreCorrelation);
    values.push(smokingScoreCorrelation);
    values.push(alcoholScoreCorrelation);

    return values;
};

function getSlope(x1, y1, x2, y2) {
    return (y2 - y1) / (x2 - x1);
}

// Provided by ChatGPT
function calculateAverageByKey(data, key) {
    const filteredData = data.filter(item => item.hasOwnProperty(key));
    const numbers = filteredData.map(item => item[key]);
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    const average = sum / numbers.length;
    return average;
}

// Made with the assistance of ChatGPT
function readJSONFile(filename) {
    const filePath = path.join(__dirname, '..', filename);
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (error, data) => {
            if (error) {
                reject(error);
                return;
            }
            const jsonData = JSON.parse(data);
            resolve(jsonData);
        });
    });
}

function getSocializationReduction(minutesOfSocialization) {
    const targetSocialization = 30;
    const riskDecreaseAtTarget = 0.12;
    return ((targetSocialization - minutesOfSocialization) / targetSocialization) * riskDecreaseAtTarget;
}

function getExerciseReduction(minutesOfExercise) {
    const targetExercise = 150 / 7;
    const riskDecreaseAtTarget = 0.3;
    return ((targetExercise - minutesOfExercise) / targetExercise) * riskDecreaseAtTarget;
}

function getDrinkingRisk(numberDrinks) {
    const riskIncreasePerDrinkOver2 = 0.0242857;
    return numberDrinks > 2 ? (numberDrinks - 2) * riskIncreasePerDrinkOver2 : 0;
}

async function getSmokingRisk(numberSmoked) {
    const filename = 'resources/cigarette_relative_risk_data.json';
    const smokingRiskIncrease = 0.37;
    const averageSmokerCigarettesPerDay = 12.5;

    return readJSONFile(filename)
        .then(data => {
            const average1 = calculateAverageByKey(data, "1");
            const average20 = calculateAverageByKey(data, "20");

            const riskPerCigaretteSlope = getSlope(1, average1, 20, average20);
            const smokingRiskAdjustment = smokingRiskIncrease / (riskPerCigaretteSlope * averageSmokerCigarettesPerDay);
            const adjustedRiskPerCigarette = riskPerCigaretteSlope * smokingRiskAdjustment;

            return adjustedRiskPerCigarette * numberSmoked;
        })
        .catch(error => {
            console.log('Error occurred while reading the JSON file:', error);
            throw error;
        });
}

async function runAlgorithm(numberOfCigarettes, numberOfDrinks, minutesOfExercise, minutesOfSocialization) {
    var values = [];
    const smokingRisk = await getSmokingRisk(numberOfCigarettes);
    values.push(smokingRisk);
    values.push(getDrinkingRisk(numberOfDrinks));
    values.push(getExerciseReduction(minutesOfExercise));
    values.push(getSocializationReduction(minutesOfSocialization));
    console.log(values);
    values.sort((a, b) => b - a);
    console.log(values);
}

runAlgorithm(12.5, 2, 0, 0);

module.exports = { runAlgorithm, train };
