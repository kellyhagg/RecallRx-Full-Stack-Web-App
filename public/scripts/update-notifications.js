// Description: This code updates the notification settings based on the user's selections.
// Implemented with the assistance of theChatGPT
// Author: Olga Zimina
// Last modified: 2023-05-26

// Initialize the notification settings by toggling the specified notification switches.
function init() {
  toggleNotification("exercise-frequency-toggle-switch");
  toggleNotification("checkup-toggle-switch");
}

// Toggle the visibility of an additional div based on the state of the checkbox.
function toggleNotification(purpose) {
  var checkBox = document.getElementById(purpose);
  var additionalDiv = document.getElementById(
    "exercise-frequency-additional-div"
  );

  if (purpose === "checkup-toggle-switch") {
    additionalDiv = document.getElementById("checkup-frequency-additional-div");
  }
  if (checkBox.checked) {
    additionalDiv.classList.remove("d-none");
  } else {
    additionalDiv.classList.add("d-none");
  }
}

// Find the selected value among the given inputs.
function findSelectedValue(...inputs) {
  let result = "";

  inputs.forEach((input) => {
    const { checked, value } = input;

    result = checked ? value : result;
  });

  return result;
}

// Update the notification settings based on the user's selections.
function updateNotifications() {
  // Prompt the user to confirm if they want to save the changes
  const isUpdate = confirm("Do you want to save the changes?");

  if (!isUpdate) {
    return;
  }

  // Get the state of the exercise and mmse toggle switches
  const isExerciseActive = document.getElementById(
    "exercise-frequency-toggle-switch"
  ).checked;
  const isMmseActive = document.getElementById("checkup-toggle-switch").checked;

  // Get all exercise and mmse input elements
  const exerciseInputs = document.querySelectorAll(
    'input[name="exerciseFrequency"]'
  );
  const mmseInputs = document.querySelectorAll('input[name="mmseFrequency"]');

  // Get the selected values for exercise and mmse frequencies
  const selectedExerciseFrequency = findSelectedValue(...exerciseInputs);
  const selectedMmseFrequency = findSelectedValue(...mmseInputs);

  // Get the hours and minutes from the time picker input
  const [hours, minutes] = document
    .getElementById("time-picker")
    .value.split(":");
  const currentDate = new Date();
  currentDate.setHours(hours);
  currentDate.setMinutes(minutes);

  // Determine the number of days based on the selected mmse frequency
  const mmsefrequency = selectedMmseFrequency;
  var numberOfDays = 7;
  switch (mmsefrequency) {
    case "every-other-week":
      numberOfDays = 14;
      break;
    case "monthly":
      numberOfDays = 30;
  }

  // Calculate the new next date by adding the number of days to the current date
  const newNextDate = new Date();
  newNextDate.setDate(currentDate.getDate() + numberOfDays);
  // Create the request body with the updated notification settings
  const body = {
    exercise: {
      frequency: selectedExerciseFrequency,
      isActive: isExerciseActive,
      wasNotificationClosed: false,
      next: currentDate.toISOString(),
    },
    mmse: {
      frequency: selectedMmseFrequency,
      isActive: isMmseActive,
      wasNotificationClosed: false,
      next: newNextDate.toISOString(),
    },
  };

  // Send a POST request to the notifications endpoint to update the notification settings.
  fetch(`${app_hosting_address}/notifications`, {
    method: "post",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      window.location.reload();
    })
    .catch((error) => {
      console.log(error);
    });
}

init();
