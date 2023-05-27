// Calculate and weight the MMSE results score for each question and provide a total score
// https://cgatoolkit.ca/Uploads/ContentDocuments/MMSE.pdf
// Author: Kelly Hagg
// Last modified: 2023-05-26

const fs = require('fs');

// Get score for time orientation related questions and return the weighted value
function getOrientationScore(year, month, day) {
    var score = 0;
    const now = new Date();
    if (year == now.getFullYear()) { score++; }
    if (month == now.getMonth() + 1) { score++; }
    if (day == getDayStr()) { score++; }
    return score * (5 / 3);
}

// Get score for object recall related questions and return the weighted value
function getObjectScore(input, correctObject) {
    var score = 0;
    var cleaned = cleanAnswer(input);
    console.log("cleaned: " + cleaned);
    if (cleaned == correctObject) { score++; }
    return score;
}

// Get score for sentence repetition related questions and return the weighted value
function getSentenceScore(input, correctSentence) {
    var score = 0;
    var cleaned = cleanAnswer(input);
    console.log("correct: " + correctSentence);
    console.log("cleaned: " + cleaned);
    if (cleaned == correctSentence) { score++; }
    return score * 2;
}

// Get score for word reversal related questions and return the weighted value
function getReversalScore(input, correctWord) {
    var score = 0;
    var reversedWord = reverseWord(correctWord);
    var cleaned = cleanAnswer(input);
    console.log("cleaned: " + cleaned);
    if (cleaned == reversedWord) { score++; }
    return score * (5 / 3);
}

// Helper functions created with the assistance of ChatGPT
function getDayStr() {
    const now = new Date();
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = daysOfWeek[now.getDay()];

    return `${dayOfWeek}`;
}

// Get the object to be recalled from objects.json file (populated using ChatGPT)
// Function created and debugged with the assistance of ChatGPT
function getObject(retrievedObjects) {
    const objectsPair = JSON.parse(fs.readFileSync('public/resources/objects.json', 'utf8'));
    var objects = objectsPair.objects;

    retrievedObjects.forEach(function (object) {
        objects = objects.filter(function (item) {
            return item !== object;
        });
        console.log("removed " + object);
    });

    const randomIndex = Math.floor(Math.random() * objects.length);
    const randomObject = objects[randomIndex];

    return randomObject;
}

// Get the sentence to be recalled from sentences.json file (populated using ChatGPT)
// Function created and debugged with the assistance of ChatGPT
function getSentence() {
    const sentencesPair = JSON.parse(fs.readFileSync('public/resources/sentences.json', 'utf8'));
    const sentences = sentencesPair.sentences;

    const randomIndex = Math.floor(Math.random() * sentences.length);
    const randomSentence = sentences[randomIndex];

    return randomSentence;
}

// Get the word to be reversed from sentences.json file (populated using ChatGPT)
// Function created and debugged with the assistance of ChatGPT
function getWord(retrievedWords) {
    const wordsPair = JSON.parse(fs.readFileSync('public/resources/words.json', 'utf8'));
    var words = wordsPair.words;

    retrievedWords.forEach(function (word) {
        words = words.filter(function (item) {
            return item !== word;
        });
        console.log("removed " + word);
    });

    const randomIndex = Math.floor(Math.random() * words.length);
    const randomWord = words[randomIndex];

    return randomWord;
}

// Function to reverse the word to compare the entered result
// Helper function created with the assistance of ChatGPT
function reverseWord(word) {
    let reversedWord = "";
    for (let i = word.length - 1; i >= 0; i--) {
        reversedWord += word[i];
    }
    return reversedWord;
}

// Function to clean answer to all lowercase and remove punctuation
// Helper function created with the assistance of ChatGPT
function cleanAnswer(answer) {
    if (!answer) {
        return "";
    }
    let cleanStr = answer.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase();
    return cleanStr;
}

// Export functions to be used in index.js file
module.exports = { getObject, getSentence, getWord, getOrientationScore, getSentenceScore, getObjectScore, getReversalScore };
