let questionScore = 0;
let questionType;
let pageCount;
let sentence;

// Function created by ChatGPT
function speak() {
    let utterance = new SpeechSynthesisUtterance('The phone fell off of the shelf.');
    utterance.voice = speechSynthesis.getVoices()[0];
    speechSynthesis.speak(utterance);
}

function getOrientationScore(questionType) {
    return 1;
}

function cleanAnswer(answer) {
    // Provided by ChatGPT
    let cleanStr = answer.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase();
    return cleanStr;
}

function verifySentence(sentence) {
    // Provided by ChatGPT
    let cleanStr = sentence.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase();
    // let cleanAnswer = "the phone fell off of the shelf";
    // if (cleanStr == cleanAnswer) {
    //     console.log("Correct!");
    //     userScore++;
    // }
    // console.log(userScore);
}

module.exports = { getOrientationScore, verifySentence };
