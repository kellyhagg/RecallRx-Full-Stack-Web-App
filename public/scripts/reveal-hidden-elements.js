/**
 * This code retrieves elements from the HTML document and performs actions based on the values of specific dataset attributes.
 * It controls the visibility of certain elements and triggers toast notifications.
 */

// Get the element with the ID "homepage"
const homepageDiv = document.getElementById("homepage");
// Get the value of the "easterEggActivated" dataset attribute from the homepage element
const isEasterEggActivated = homepageDiv.dataset.easterEggActivated === "true";
//  Get the element with the class "scrolling-wrapper"
const scrollingSection = document.querySelector(".scrolling-wrapper");
//  Get the element with the class "easter-egg"
const meditationButton = document.querySelector(".easter-egg");

// Reveal meditation button if the easter egg is activated
if (isEasterEggActivated) {
  scrollingSection.classList.remove(
    "d-flex",
    "align-items-center",
    "justify-content-center"
  );
  meditationButton.classList.remove("d-none");
} else {
  // Hide  meditation button if the easter egg is not activated
  scrollingSection.classList.add(
    "d-flex",
    "align-items-center",
    "justify-content-center"
  );
  meditationButton.classList.add("d-none");
}
//  Get the value of the "showCheckupNotification" dataset attribute from the homepage element
const showCheckupNotification =
  homepageDiv.dataset.showCheckupNotification === "true";
//  Get the value of the "appHostingAddress" dataset attribute from the homepage element
const appHostingAddress = homepageDiv.dataset.appHostingAddress;
// Get the element with the ID "checkup-notification"
const checkupNotification = document.querySelector("#checkup-notification");
// Get the element with the ID "puzzle-notification"
const puzzleNotification = document.querySelector("#puzzle-notification");
// Create a new Bootstrap Toast for the checkup notification element
const checkupToast = new bootstrap.Toast(checkupNotification);
// Create a new Bootstrap Toast for the puzzle notification element
const puzzleToast = new bootstrap.Toast(puzzleNotification);

// showCheckupNotification = true;
showExerciseNotification = false;

// Show /hide the checkup notification toast based on the value of showCheckupNotification
if (showCheckupNotification) {
  checkupToast.show();
} else {
  checkupToast.hide();
}

// Show/hide the puzzle notification toast based on the value of showExerciseNotification
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
