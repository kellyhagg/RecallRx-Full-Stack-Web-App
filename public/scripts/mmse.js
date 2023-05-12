console.log("mmse.js loaded");

var userScore = 0;
var questionType;
var pageCount;
var sentence;

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
let index = 0;

const upButton = document.querySelector(".up");
const downButton = document.querySelector(".down");
const value = document.querySelector(".spinner-value");

// Feature created by ChatGPT
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

// function nextQuestionButton(questionType) {
//     // Following line provided by ChatGPT
//     var pageCount = localStorage.getItem('pageCount') || 1;
//     console.log(questionType)
//     if (questionType == "landing-page") {
//         window.location.href = "/mmse-sentence-recall";
//     } else if (questionType == "sentence-recall") {
//         var userInput = document.getElementById("mmse-input").value;
//         verifySentence(userInput);
//         window.location.href = "/mmse-orientation";
//     } else if (questionType == "orientation") {
//     } else if (questionType == "object-recall") {
//         if (pageCount > 1) {
//             // window.location.href = "/mmse-landing-page";
//         } else {
//             pageCount++;
//             // Following line provided by ChatGPT
//             localStorage.setItem('pageCount', pageCount);
//             console.log(pageCount);
//             window.location.href = `/mmse-object-recall?pageCount=${pageCount}`;
//         }
//     }
// }


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

