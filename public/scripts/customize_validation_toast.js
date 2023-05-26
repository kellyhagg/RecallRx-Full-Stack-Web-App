var input = "";

// Get the password, email, or name input elements
if (document.querySelector("#password")) {
  input = document.querySelector("#password");
} else if (document.querySelector('input[type="email"]')) {
  input = document.querySelector('input[type="email"]');
} else if (document.querySelector("#name")) {
  input = document.querySelector("#name");
}

// Remove validation messages
function removeToasts() {
  const toast = event.target.nextElementSibling;
  if (toast && toast.classList.contains("custom-validation-message")) {
    toast.remove();
  }
  const errorMessage = document.querySelector(".error-message");
  errorMessage.textContent = "";
}

// Add event listener for invalid input
input.addEventListener("invalid", function (event) {
  event.preventDefault(); // Prevent the default browser validation behavior
  removeToasts(); // Remove any existing validation message toast
  // Check if the input is not valid
  if (!event.target.validity.valid) {
    var validationMessage = event.target.validationMessage;
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
input.addEventListener("input", function (event) {
  removeToasts(); // Remove previous error messages
  event.target.setCustomValidity(""); // Reset the custom validity message
});
