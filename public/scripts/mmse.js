var userScore = 0;
var questionType;
var sentence;

// Function created by ChatGPT
function speak() {
    var utterance = new SpeechSynthesisUtterance('The phone fell off of the shelf.');
    utterance.voice = speechSynthesis.getVoices()[0];
    speechSynthesis.speak(utterance);
}

function nextQuestionButton(questionType) {
    console.log(questionType)
    if (questionType == "landing-page") {
        window.location.href = "/mmse-sentence-recall";
    }
    if (questionType == "sentence-recall") {
        var userInput = document.getElementById("mmse-input").value;
        verifySentence(userInput);
    }
}

function verifySentence(sentence) {
    // Provided by ChatGPT
    let cleanStr = sentence.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase();
    let cleanAnswer = "the phone fell off of the shelf";
    console.log(cleanStr);
    if (cleanStr == cleanAnswer) {
        console.log("Correct!");
        userScore++;
    }
    console.log(userScore);
}

console.log(questionType);

