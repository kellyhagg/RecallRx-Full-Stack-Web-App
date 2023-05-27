// Get references to the password and confirmPassword input elements
var password = document.getElementById("password");
var confirmPassword = document.getElementById("confirmPassword");
// Get a reference to the error message element
var errorMessage = document.getElementById("error-message");

// Enable the submit button
function enableSubmitButton() {
  document.getElementById("submitButton").disabled = false;
}

// Disable the submit button
function disableSubmitButton() {
  document.getElementById("submitButton").disabled = true;
}

// Check if the passwords match
function checkPasswordsMatch() {
  if (password.value !== confirmPassword.value) {
    errorMessage.classList.remove("d-none"); // Show the error message
    disableSubmitButton(); // Disable the submit button
    console.log("Passwords don't match.");
  } else {
    errorMessage.classList.add("d-none"); // Hide the error message
    enableSubmitButton(); // Enable the submit button
    console.log("Passwords match");
  }
}

// Add an event listener to the password input for the "blur" (key up) event
password.onblur = checkPasswordsMatch;
// Add an event listener to the confirmPassword input for the "blur" (key up) event
confirmPassword.onblur = checkPasswordsMatch;

// Get references to the password and confirmPassword input elements using querySelector
const passwordInput = document.querySelector("#password");
const confirmPasswordInput = document.querySelector("#confirmPassword");

// Add an event listener to the password input for the "invalid" event
passwordInput.addEventListener("invalid", function (event) {
  event.preventDefault(); // Prevent the browser's default error message from appearing
  removeToast(event.target);
  if (!event.target.validity.valid) {
    const validationMessage = event.target.validationMessage;
    const toast = document.createElement("div");
    toast.classList.add("custom-validation-message");
    toast.textContent = validationMessage;
    event.target.insertAdjacentElement("afterend", toast);
  }
});

// Add an event listener to the password input for the "input" event
passwordInput.addEventListener("input", function (event) {
  const toast = event.target.nextElementSibling;
  if (toast && toast.classList.contains("custom-validation-message")) {
    toast.remove(); // Remove the custom validation message if it exists
  }
  event.target.setCustomValidity(""); // Reset the custom validity message
});

// Add an event listener to the confirmPassword input for the "invalid" event
confirmPasswordInput.addEventListener("invalid", function (event) {
  event.preventDefault(); // Prevent the browser's default error message from appearing
  removeToast(event.target);
  if (!event.target.validity.valid) {
    const validationMessage = event.target.validationMessage;
    const toast = document.createElement("div");
    toast.classList.add("custom-validation-message");
    toast.textContent = validationMessage;
    event.target.insertAdjacentElement("afterend", toast);
  }
});

// Add an event listener to the confirmPassword input for the "input" event
confirmPasswordInput.addEventListener("input", function (event) {
  const toast = event.target.nextElementSibling;
  if (toast && toast.classList.contains("custom-validation-message")) {
    toast.remove(); // Remove the custom validation message if it exists
  }
  event.target.setCustomValidity(""); // Reset the custom validity message
});
