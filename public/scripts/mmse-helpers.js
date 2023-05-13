// Function created by ChatGPT
function speak(phrase) {
    let utterance = new SpeechSynthesisUtterance(phrase);
    utterance.voice = speechSynthesis.getVoices()[0];
    speechSynthesis.speak(utterance);
}