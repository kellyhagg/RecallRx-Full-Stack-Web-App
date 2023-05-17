const content = document.querySelector(".content"),
  musicImage = content.querySelector(".music-image img"),
  musicTitle = content.querySelector(".music-title"),
  audio = content.querySelector(".audio"),
  playBtn = content.querySelector(".play-pause"),
  playBtnIcon = content.querySelector(".play-pause i"),
  progressBar = content.querySelector(".progress-bar"),
  progressInfo = content.querySelector(".progress-info"),
  loopBtn = content.querySelector("#loop");

let index = 1;
let isLooping = false;

window.addEventListener("load", () => {
  loadData(index);
});

function loadData(index) {
  musicImage.src = "images/objects/book.jpg";
  musicTitle.innerHTML = music[index - 1].purpose;
  //   musicImage.src = "images/" + music[indexValue - 1].img + ".jpg";
  audio.src = "music/" + music[index - 1].audio + ".mp3";
}

// Play - pause
playBtn.addEventListener("click", () => {
  const isMusicPaused = content.classList.contains("paused");
  if (isMusicPaused) {
    pause();
  } else {
    play();
  }
});

function play() {
  content.classList.add("paused");
  playBtnIcon.innerHTML = "pause";
  audio.play();
}

function pause() {
  content.classList.remove("paused");
  playBtnIcon.innerHTML = "play_arrow";
  audio.pause();
}

// Time bar
audio.addEventListener("timeupdate", (e) => {
  const currentTime = e.target.currentTime; // get current melody timestamp
  const duration = e.target.duration; // get melody duration
  let progressBarWidth = (currentTime / duration) * 100; // calculate progress width
  progressBar.style.width = progressBarWidth + "%";

  // Update time bar UI
  progressInfo.addEventListener("click", (e) => {
    let progressValue = progressInfo.clientWidth; // get width of Progress Bar
    let clickedOffsetX = e.offsetX; // get offset x value
    let melodyDuration = audio.duration; // get total music duration

    audio.currentTime = (clickedOffsetX / progressValue) * melodyDuration;
  });

  //Timer Logic
  audio.addEventListener("loadeddata", () => {
    let durationTimeText = content.querySelector(".duration");

    //Update finalDuration
    let durationValue = audio.duration;
    let durationMinutes = Math.floor(durationValue / 60);
    let durationSeconds = Math.floor(durationValue % 60);
    if (durationSeconds < 10) {
      durationSeconds = "0" + finalSeconds;
    }
    durationTimeText.innerText = durationMinutes + ":" + durationSeconds;
  });

  //Update Current Duration
  let currentTimeText = content.querySelector(".current-time");
  let currentTimeValue = audio.currentTime;
  let currentMinutes = Math.floor(currentTimeValue / 60);
  let currentSeconds = Math.floor(currentTimeValue % 60);
  if (currentSeconds < 10) {
    currentSeconds = "0" + currentSeconds;
  }
  currentTimeText.innerText = currentMinutes + ":" + currentSeconds;


});
