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

// Provided by ChatGPT
function findIndicesOfLargestValues(arr) {
    let firstLargestIndex = 0;
    let secondLargestIndex = -1;

    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > arr[firstLargestIndex]) {
            secondLargestIndex = firstLargestIndex;
            firstLargestIndex = i;
        } else if (arr[i] !== arr[firstLargestIndex] && (secondLargestIndex === -1 || arr[i] > arr[secondLargestIndex])) {
            secondLargestIndex = i;
        }
    }

    return [firstLargestIndex, secondLargestIndex];
}

async function runAlgorithm(input, coefficients) {
    var values = [];
    var exerciseRisk = getExerciseReduction(input[0]);
    var socializationRisk = getSocializationReduction(input[1]);
    var smokingRisk = await getSmokingRisk(input[2]);
    var drinkingRisk = getDrinkingRisk(input[3]);

    exerciseRisk = exerciseRisk * coefficients[0];
    socializationRisk = socializationRisk * coefficients[1];
    smokingRisk = smokingRisk * coefficients[2];
    drinkingRisk = drinkingRisk * coefficients[3];

    values.push(exerciseRisk);
    values.push(socializationRisk);
    values.push(smokingRisk);
    values.push(drinkingRisk);

    const indices = findIndicesOfLargestValues(values);

    var firstRecommendation = "";
    var secondRecommendation = "";

    if (indices[0] == 0) { firstRecommendation = "exercise"; }
    else if (indices[0] == 1) { firstRecommendation = "social"; }
    else if (indices[0] == 2) { firstRecommendation = "smoking"; }
    else if (indices[0] == 3) { firstRecommendation = "drinking"; }

    if (indices[1] == 0) { secondRecommendation = "exercise"; }
    else if (indices[1] == 1) { secondRecommendation = "social"; }
    else if (indices[1] == 2) { secondRecommendation = "smoking"; }
    else if (indices[1] == 3) { secondRecommendation = "drinking"; }

    return [firstRecommendation, secondRecommendation];
}

module.exports = { runAlgorithm, train };
