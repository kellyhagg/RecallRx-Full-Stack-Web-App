var userScore = 0;
var questionType;
var sentence;

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
let index = 0;

const upButton = document.querySelector(".up");
const downButton = document.querySelector(".down");
const value = document.querySelector(".spinner-value");

if (window.location.pathname == "/mmse-orientation") {
    upButton.addEventListener("click", () => {
        index++;
        if (index >= days.length) {
            index = 0;
        }
        value.value = days[index];
    });

    downButton.addEventListener("click", () => {
        index--;
        if (index < 0) {
            index = days.length - 1;
        }
        value.value = days[index];
    });
}

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
    } else if (questionType == "sentence-recall") {
        var userInput = document.getElementById("mmse-input").value;
        verifySentence(userInput);
        window.location.href = "/mmse-orientation";
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

