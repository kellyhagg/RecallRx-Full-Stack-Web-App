// Description: This file contains functions that controls
// player components (play, pause, loop, progress bar, time)
// Author: Olga Zimina
// Last modified: 2023-05-26

// Initialize variables and DOM elements
const content = document.querySelector(".content"),
  musicTitle = content.querySelector(".music-title"),
  audio = content.querySelector(".audio"),
  playBtn = content.querySelector(".play-pause"),
  playBtnIcon = content.querySelector(".play-pause i"),
  progressBar = content.querySelector(".progress-bar"),
  progressInfo = content.querySelector(".progress-info"),
  loopBtn = content.querySelector("#loop");
drop = content.querySelector(".drop");

let index = 1;
let isLooping = false;

// Load data when the window is loaded
window.addEventListener("load", () => {
  loadData(index);
});

//  Load data based on index
function loadData(index) {
  musicTitle.innerHTML = music[index - 1].purpose;
  audio.src = "music/" + music[index - 1].audio + ".mp3";
}

// Play - pause
playBtn.addEventListener("click", () => {
  // Check if the music is currently paused
  const isMusicPaused = content.classList.contains("paused");
  // If the music is paused, call the pause() function
  if (isMusicPaused) {
    pause();
  }
  // If the music is not paused, call the play() function
  else {
    play();
  }
});

function play() {
  content.classList.add("paused");
  playBtnIcon.innerHTML = "pause";
  drop.classList.add("animated");
  audio.play(); // Start playing the audio
}

function pause() {
  content.classList.remove("paused");
  playBtnIcon.innerHTML = "play_arrow";
  drop.classList.remove("animated");
  audio.pause(); // Pause the audio
}

// Update melody duration
function setDurationTime(durationTimeText) {
  let durationValue = audio.duration;
  let durationMinutes = Math.floor(durationValue / 60);
  let durationSeconds = Math.floor(durationValue % 60);
  if (durationSeconds < 10) {
    durationSeconds = "0" + durationSeconds;
  }
  durationTimeText.innerText = durationMinutes + ":" + durationSeconds;
}

// Time bar
audio.addEventListener("timeupdate", (e) => {
  const currentTime = e.target.currentTime; // Get current melody timestamp
  const duration = e.target.duration; // Get melody duration
  let progressBarWidth = (currentTime / duration) * 100; // Calculate progress width
  progressBar.style.width = progressBarWidth + "%";
  if (duration === currentTime) {
    pause();
  }

  // Update time bar UI
  progressInfo.addEventListener("click", (e) => {
    let progressValue = progressInfo.clientWidth; // Get width of Progress Bar
    let clickedOffsetX = e.offsetX; // Get offset x value
    let melodyDuration = audio.duration; // Get total music duration

    audio.currentTime = (clickedOffsetX / progressValue) * melodyDuration;
  });

  //Timer Logic
  let durationTimeText = content.querySelector(".duration");
  audio.addEventListener("loadeddata", () => {
    setDurationTime(durationTimeText);
  });

  setDurationTime(durationTimeText);

  //Update Current Duration
  let currentTimeText = content.querySelector(".current-time");
  let currentTimeValue = audio.currentTime;
  let currentMinutes = Math.floor(currentTimeValue / 60);
  let currentSeconds = Math.floor(currentTimeValue % 60);
  if (currentSeconds < 10) {
    currentSeconds = "0" + currentSeconds;
  }
  currentTimeText.innerText = currentMinutes + ":" + currentSeconds;

  // Looping Logic
  if (isLooping && currentTime >= duration - 0.5) {
    // Restart the melody when it's about to finish
    audio.currentTime = 0;
    audio.play();
  }
});

// Loop button
loopBtn.addEventListener("click", () => {
  isLooping = !isLooping;
  const loopBtnContainer = document.querySelector(".loop");
  if (isLooping) {
    loopBtnContainer.classList.remove("deactivated");
  } else {
    loopBtnContainer.classList.add("deactivated");
  }
  loopBtn.classList.toggle("active");
});
