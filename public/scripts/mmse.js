// Function created by ChatGPT
function speak() {
    var utterance = new SpeechSynthesisUtterance('The phone fell off of the shelf.');
    utterance.voice = speechSynthesis.getVoices()[0];
    speechSynthesis.speak(utterance);
}

