// Helper functions for use in mmse.js file
// Author: Kelly Hagg
// Last modified: 2023-05-26

const button = document.getElementById("sentenceSpeakBtn");

// Disable the speech button after it is clicked to test memory (it can only be heard once)
if (button) {
    button.addEventListener("click", function () {
        button.disabled = true;
    });
}

// Function created by ChatGPT
function speak(phrase) {
    let utterance = new SpeechSynthesisUtterance(phrase);
    utterance.voice = speechSynthesis.getVoices()[0];
    speechSynthesis.speak(utterance);
}

