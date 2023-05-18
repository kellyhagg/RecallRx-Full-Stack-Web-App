const fs = require('fs');
const path = require('path');

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

function getDrinkingRisk(numberDrinks) {
    const riskIncreasePerDrinkOver2 = 0.0242857;
    return numberDrinks > 2 ? (numberDrinks - 2) * riskIncreasePerDrinkOver2 : 0;
}

function getSmokingRisk(numberSmoked) {
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

async function runAlgorithm() {
    await getSmokingRisk(10)
        .then(result => {
            console.log(result);
        });;
    console.log(getDrinkingRisk(10));
}

runAlgorithm();

