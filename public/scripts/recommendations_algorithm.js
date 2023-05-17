const fs = require('fs');
const path = require('path');

const smokingRiskIncrease = 0.37;

// Provided by ChatGPT
function calculateAverageByKey(data, key) {
    const filteredData = data.filter(item => item.hasOwnProperty(key));
    const numbers = filteredData.map(item => item[key]);
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    const average = sum / numbers.length;
    return average;
}

// Made with the assistance of ChatGPT
function readJSONFile(filename, callback) {
    const filePath = path.join(__dirname, '..', filename);
    fs.readFile(filePath, 'utf8', (error, data) => {
        if (error) {
            console.log('Error occurred while reading the JSON file:', error);
            return;
        }
        const jsonData = JSON.parse(data);
        callback(jsonData);
    });
}

function getSlope(x1, y1, x2, y2) {
    return (y2 - y1) / (x2 - x1);
}

function runAlgorithm() {
    const filename = 'resources/cigarette_relative_risk_data.json';

    readJSONFile(filename, (data) => {
        const average1 = calculateAverageByKey(data, "1");
        const average20 = calculateAverageByKey(data, "20");

        const riskPerCigarette = smokingRiskIncrease * getSlope(1, average1, 20, average20);
        console.log(riskPerCigarette);
    });
}

runAlgorithm();
