const homepageDiv = document.getElementById("homepage");
const showCheckupNotification =
  homepageDiv.dataset.showCheckupNotification === "true";
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
  fetch("http://localhost:3000/checkup-toast-state-update", {
    method: "post",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      window.location.reload(); // Reload the current page
      // Alternatively, you can use other navigation methods like window.location.href = "home.html" to redirect to a specific page
    })
    .catch((error) => {
      console.log(error);
    });
});
