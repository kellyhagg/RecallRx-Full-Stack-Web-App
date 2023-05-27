// Description: This file contains customization for validation errors toasts.
// Author: Olga Zimina
// Last modified: 2023-05-26

// Get the email input element
const emailInput = document.querySelector('input[type="email"]');

// Add event listener for "invalid" event
emailInput.addEventListener("invalid", function (event) {
  event.preventDefault();
  // Check if the input is not valid
  if (!event.target.validity.valid) {
    const validationMessage = event.target.validationMessage;
    const toast = document.createElement("div");
    toast.classList.add("custom-validation-message");
    // Customize the validation message for Safari
    if (validationMessage === "Enter an email address") {
      validationMessage = "Please enter a valid email address.";
    }
    toast.textContent = validationMessage;
    event.target.insertAdjacentElement("afterend", toast);
  }
});

// Add event listener for "input" event
emailInput.addEventListener("input", function (event) {
  const toast = event.target.nextElementSibling;
  // Remove the custom validation message if it exists
  if (toast && toast.classList.contains("custom-validation-message")) {
    toast.remove();
  }
  event.target.setCustomValidity(""); // Reset the custom validity message
});
