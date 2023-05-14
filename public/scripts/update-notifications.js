// Implemented with the assistance of theChatGPT
function init() {
  toggleNotification("exercise-frequency-toggle-switch");
  toggleNotification("checkup-toggle-switch");
}

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

function findSelectedValue(...inputs) {
  let result = "";

  inputs.forEach((input) => {
    const { checked, value } = input;

    result = checked ? value : result;
  });

  return result;
}

function updateNotifications() {
  const isUpdate = confirm("Update?");

  if (!isUpdate) {
    return;
  }

  const isExerciseActive = document.getElementById(
    "exercise-frequency-toggle-switch"
  ).checked;
  const isMmseActive = document.getElementById("checkup-toggle-switch").checked;

  const exerciseInputs = document.querySelectorAll(
    'input[name="exerciseFrequency"]'
  );
  const mmseInputs = document.querySelectorAll('input[name="mmseFrequency"]');

  const selectedExerciseFrequency = findSelectedValue(...exerciseInputs);
  const selectedMmseFrequency = findSelectedValue(...mmseInputs);

  const [hours, minutes] = document
    .getElementById("time-picker")
    .value.split(":");
  const currentDate = new Date();
  currentDate.setHours(hours);
  currentDate.setMinutes(minutes);

  const body = {
    exercise: {
      frequency: selectedExerciseFrequency,
      isActive: isExerciseActive,
      next: currentDate.toISOString(),
    },
    mmse: {
      frequency: selectedMmseFrequency,
      isActive: isMmseActive,
    },
  };

  fetch("http://localhost:3000/notifications", {
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
      // Or redirect to home, go back
    })
    .catch((error) => {
      console.log(error);
    });
}

init();
