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


