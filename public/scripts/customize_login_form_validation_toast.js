// Get the password input element
const passwordInput = document.querySelector("#floatingPassword");
// Get the username input element// Get the password input element
const userNameInput = document.querySelector("#floatingInput");

// Remove the toast validation message
function removeToast(element) {
  const toast = element.nextElementSibling;
  if (toast && toast.classList.contains("custom-validation-message")) {
    toast.remove();
  }
}

// Add event listener for password input when it becomes invalid
passwordInput.addEventListener("invalid", function (event) {
  event.preventDefault(); // Prevent the default browser validation behavior
  removeToast(event.target); // Remove any existing validation message toast

  // Check if the input is not valid
  if (!event.target.validity.valid) {
    const validationMessage = event.target.validationMessage;
    const toast = document.createElement("div");
    toast.classList.add("custom-validation-message"); // Add a class for styling
    toast.textContent = validationMessage; // Set the validation message text
    event.target.insertAdjacentElement("afterend", toast); // Insert the toast element after the input
  }
});

// Add event listener for password input on input change
passwordInput.addEventListener("input", function (event) {
  removeToast(event.target); // Remove any existing validation message toast
  event.target.setCustomValidity(""); // Reset the custom validation message
});

// Add event listener for username input when it becomes invalid
userNameInput.addEventListener("invalid", function (event) {
  event.preventDefault(); // Prevent the default browser validation behavior
  removeToast(event.target); // Remove any existing validation message toast

  // Check if the input is not valid
  if (!event.target.validity.valid) {
    const validationMessage = event.target.validationMessage;
    const toast = document.createElement("div");
    toast.classList.add("custom-validation-message"); // Add a class for styling
    toast.textContent = validationMessage; // Set the validation message text
    event.target.insertAdjacentElement("afterend", toast); // Insert the toast element after the input
  }
});

// Add event listener for username input on input change
userNameInput.addEventListener("input", function (event) {
  removeToast(event.target); // Remove any existing validation message toast
  event.target.setCustomValidity(""); // Reset the custom validation message
});
