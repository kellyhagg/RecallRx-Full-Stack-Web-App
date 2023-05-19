// Handle easter egg button
const homepageDiv = document.getElementById("homepage");
const isEasterEggActivated = homepageDiv.dataset.easterEggActivated === "true";

const scrollingSection = document.querySelector(".scrolling-wrapper");
const meditationButton = document.querySelector(".easter-egg");

if (isEasterEggActivated) {
  scrollingSection.classList.remove(
    "d-flex",
    "align-items-center",
    "justify-content-center"
  );
  meditationButton.classList.remove("d-none");
} else {
  scrollingSection.classList.add(
    "d-flex",
    "align-items-center",
    "justify-content-center"
  );
  meditationButton.classList.add("d-none");
}
