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

window.addEventListener("load", () => {
  loadData(index);
});

function loadData(index) {
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
  drop.classList.add("animated");
  audio.play();
}

function pause() {
  content.classList.remove("paused");
  playBtnIcon.innerHTML = "play_arrow";
  drop.classList.remove("animated");
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
      durationSeconds = "0" + durationSeconds;
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

  // Looping Logic
  if (isLooping && currentTime >= duration - 0.5) {
    // Restart the melody when it's about to finish
    console.log(isLooping);
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
    console.log("loop is deactivated");
  } else {
    loopBtnContainer.classList.add("deactivated");
    console.log("loop is activated");
  }
  loopBtn.classList.toggle("active");
});
