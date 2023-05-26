// Using the data from the users daily tracked activities, their completed MMSE scores,
// risk factor values found from online research, and the correlation values found from the
// machine learning training function, determine the most effective activity the user could
// do to reduce their risk of dementia based on the previous month's trends.

// Generally, the more exercise, socialization, and less smoking and drinking, the lower the risk of
// dementia. In order to determine the most effective activity using machine learning, the 
// correlation values between each activity and the resulting MMSE score are calculated. The initial 
// values found from online research are of limited use, as they are all separate studies. 
// They are made increasingly more accurate the more users that use the application, as correlation
// values are calculated for each user and are averaged together. This occurs in the train() 
// function at a random frequency of roughly 1/100. The most current correlation values are stored
// in the mongoDB database, and the medical research values are multiplied by the correlation values 
// to determine the relative risk reduction. Based on this, and the user's entered activities,
// the two most impactful activities are then recommended to the user each day.

// Author: Kelly Hagg
// Last modified: 2023-05-26

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

// Calculate the slope values for the research values
// Made with the assistance of ChatGPT
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

// Calculate the relative risk reduction from socialization
function getSocializationReduction(minutesOfSocialization) {
    // source: https://www.medicalnewstoday.com/articles/326064#Studying-social-activity-and-dementia
    const targetSocialization = 30;
    const riskDecreaseAtTarget = 0.12;
    return ((targetSocialization - minutesOfSocialization) / targetSocialization) * riskDecreaseAtTarget;
}

// Calculate the relative risk reduction from exercise
function getExerciseReduction(minutesOfExercise) {
    // source: https://www.mayoclinic.org/healthy-lifestyle/fitness/expert-answers/exercise/faq-20057916
    const targetExercise = 150 / 7;
    // source: https://www.alzheimers.org.uk/about-dementia/risk-factors-and-prevention/physical-exercise
    const riskDecreaseAtTarget = 0.3;
    return ((targetExercise - minutesOfExercise) / targetExercise) * riskDecreaseAtTarget;
}

// Calculate the relative risk increase from drinking alcohol
function getDrinkingRisk(numberDrinks) {
    // source: https://www.alzheimers.org.uk/about-dementia/risk-factors-and-prevention/alcohol
    const riskIncreasePerDrinkOver2 = 0.0242857;
    return numberDrinks > 2 ? (numberDrinks - 2) * riskIncreasePerDrinkOver2 : 0;
}

// Calculate the relative risk increase from smoking cigarettes
async function getSmokingRisk(numberSmoked) {
    // populated with data from: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5781309/
    const filename = 'resources/cigarette_relative_risk_data.json';
    // source: https://www.alzheimersresearchuk.org/blog/all-you-need-to-know-about-smoking-and-dementia/#:~:text=A%20recent%20review%20of%2037,likely%20to%20develop%20Alzheimer%27s%20disease
    const smokingRiskIncrease = 0.37;
    const averageSmokerCigarettesPerDay = 12.5;

    // Calculate the relative risk increase from smoking cigarettes
    // Function made and debugged with the assistance of ChatGPT
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

// Multiply the users activity inputs by the calculated coefficients and provide recommendations
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

    // Find the two largest values and return the corresponding recommendations
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

// Export the algorithm for use in other files
module.exports = { runAlgorithm, train };
