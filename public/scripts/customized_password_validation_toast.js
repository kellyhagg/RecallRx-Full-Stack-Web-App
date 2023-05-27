// Description: This file contains customization for validation errors toasts.
// Author: Olga Zimina
// Last modified: 2023-05-26

// Get the password and confirm password input elements
const passwordInput = document.querySelector("#password");
const confirmPasswordInput = document.querySelector("#confirmPassword");

// Add event listener for invalid input for the "Password" field
passwordInput.addEventListener("invalid", function (event) {
  event.preventDefault(); // Prevent the default browser validation behavior
  // Check if the input is not valid
  if (!event.target.validity.valid) {
    const validationMessage = event.target.validationMessage;
    const toast = document.createElement("div");
    toast.classList.add("custom-validation-message");
    toast.textContent = validationMessage;
    event.target.insertAdjacentElement("afterend", toast);
  }
});

// Add event listener for "input" event
passwordInput.addEventListener("input", function (event) {
  const toast = event.target.nextElementSibling;
  if (toast && toast.classList.contains("custom-validation-message")) {
    toast.remove();
  }
  event.target.setCustomValidity(""); // Reset the custom validity message
});

// Add event listener for invalid input for the "Confirm Password" field
confirmPasswordInput.addEventListener("invalid", function (event) {
  event.preventDefault(); // Prevent the default browser validation behavior
  // Check if the input is not valid
  if (!event.target.validity.valid) {
    const validationMessage = event.target.validationMessage;
    const toast = document.createElement("div");
    toast.classList.add("custom-validation-message");
    toast.textContent = validationMessage;
    event.target.insertAdjacentElement("afterend", toast);
  }
});

// Add event listener for "input" event on the "Confirm Password" field
confirmPasswordInput.addEventListener("input", function (event) {
  const toast = event.target.nextElementSibling;
  if (toast && toast.classList.contains("custom-validation-message")) {
    toast.remove(); // Remove the toast validation message if it exists
  }
  event.target.setCustomValidity(""); // Reset the custom validity message
});
