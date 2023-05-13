let questionScore = 0;
let questionType;
let pageCount;
let sentence;

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
