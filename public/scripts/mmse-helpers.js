// Function created by ChatGPT
function speak() {
    let utterance = new SpeechSynthesisUtterance('the phone fell off of the shelf');
    utterance.voice = speechSynthesis.getVoices()[0];
    speechSynthesis.speak(utterance);
}