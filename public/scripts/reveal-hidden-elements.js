const checkupNotification = document.querySelector("#checkup-notification");
const puzzleNotification = document.querySelector("#puzzle-notification");

const checkupToast = new bootstrap.Toast(checkupNotification);
const puzzleToast = new bootstrap.Toast(puzzleNotification);

showCheckupNotification = true;
showExerciseNotification = true;

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
