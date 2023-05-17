const fs = require('fs');
const path = require('path');

function calculateAverageByKey(data, key) {
    const numbers = data.map(item => item[key]);
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    const average = sum / numbers.length;
    return average;
}

function readJSONFile(filename, callback) {
    const filePath = path.join(__dirname, '..', filename);
    fs.readFile(filePath, 'utf8', (error, data) => {
        if (error) {
            console.log('Error occurred while reading the JSON file:', error);
            return;
        }

        // Parse the JSON data
        const jsonData = JSON.parse(data);

        // Invoke the callback function with the retrieved data
        callback(jsonData);
    });
}

function runAlgorithm() {
    const filename = 'resources/cigarette_relative_risk_data.json';

    // Pass a callback function to readJSONFile to process the retrieved data
    readJSONFile(filename, (data) => {
        const average1 = calculateAverageByKey(data, "1");
        const average20 = calculateAverageByKey(data, "20");

        const result = [average1, average20];
        console.log(result);
    });
}

// Call the function to run the algorithm
runAlgorithm();
