const fs = require('fs');

function getOrientationScore(year, month, day) {
    var score = 0;
    const now = new Date();
    if (year == now.getFullYear()) { score++; }
    if (month == now.getMonth() + 1) { score++; }
    if (day == getDayStr()) { score++; }
    return score * (5 / 3);
}

function getObjectScore(input, correctObject) {
    var score = 0;
    var cleaned = cleanAnswer(input);
    console.log("cleaned: " + cleaned);
    if (cleaned == correctObject) { score++; }
    return score;
}

function getSentenceScore(input, correctSentence) {
    var score = 0;
    var cleaned = cleanAnswer(input);
    console.log("correct: " + correctSentence);
    console.log("cleaned: " + cleaned);
    if (cleaned == correctSentence) { score++; }
    return score * 2;
}

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

function getObject() {
    const objectsPair = JSON.parse(fs.readFileSync('public/resources/objects.json', 'utf8'));
    const objects = objectsPair.objects;

    const randomIndex = Math.floor(Math.random() * objects.length);
    const randomObject = objects[randomIndex];

    return randomObject;
}

function getSentence() {
    const sentencesPair = JSON.parse(fs.readFileSync('public/resources/sentences.json', 'utf8'));
    const sentences = sentencesPair.sentences;

    const randomIndex = Math.floor(Math.random() * sentences.length);
    const randomSentence = sentences[randomIndex];

    return randomSentence;
}


function getWord() {
    const wordsPair = JSON.parse(fs.readFileSync('public/resources/words.json', 'utf8'));
    const words = wordsPair.words;

    const randomIndex = Math.floor(Math.random() * words.length);
    const randomWord = words[randomIndex];

    return randomWord;
}

function reverseWord(word) {
    let reversedWord = "";
    for (let i = word.length - 1; i >= 0; i--) {
        reversedWord += word[i];
    }
    return reversedWord;
}

function cleanAnswer(answer) {
    if (!answer) {
        return "";
    }
    let cleanStr = answer.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase();
    return cleanStr;
}

module.exports = { getObject, getSentence, getWord, getOrientationScore, getSentenceScore, getObjectScore, getReversalScore };
