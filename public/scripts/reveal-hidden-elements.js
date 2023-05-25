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
const showCheckupNotification =
  homepageDiv.dataset.showCheckupNotification === "true";
const appHostingAddress = homepageDiv.dataset.appHostingAddress;
const checkupNotification = document.querySelector("#checkup-notification");
const puzzleNotification = document.querySelector("#puzzle-notification");

const checkupToast = new bootstrap.Toast(checkupNotification);
const puzzleToast = new bootstrap.Toast(puzzleNotification);

// showCheckupNotification = true;
showExerciseNotification = false;

if (showCheckupNotification) {
  checkupToast.show();
} else {
  checkupToast.hide();
}

if (showExerciseNotification) {
  puzzleToast.show();
} else {
  puzzleToast.hide();
}

// Implemented with assistance from chatGPT
$("#mmse-toast-close").on("click", function () {
  // Prepare the request body
  var body = {
    wasNotificationClosed: true,
  };
  // Send the HTTP POST request
  fetch(`${appHostingAddress}/checkup-toast-state-update`, {
    method: "post",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      window.location.reload(); // Reload the current page
    })
    .catch((error) => {
      console.log(error);
    });
});
