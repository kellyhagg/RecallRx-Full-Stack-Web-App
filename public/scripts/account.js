var password = document.getElementById("password");
var confirmPassword = document.getElementById("confirmPassword");
var errorMessage = document.getElementById("error-message");

function enableSubmitButton() {
  document.getElementById("submitButton").disabled = false;
}

function disableSubmitButton() {
  document.getElementById("submitButton").disabled = true;
}

function checkPasswordsMatch() {
  if (password.value !== confirmPassword.value) {
    errorMessage.classList.remove("d-none");
    disableSubmitButton();
    console.log("Passwords don't match.");
  } else {
    errorMessage.classList.add("d-none");
    enableSubmitButton();
    console.log("Passwords match");
  }
}
console.log(password.value);
console.log(confirmPassword.value);

password.onblur = checkPasswordsMatch;
confirmPassword.onblur = checkPasswordsMatch;

const passwordInput = document.querySelector("#password");
const confirmPasswordInput = document.querySelector("#confirmPassword");

passwordInput.addEventListener("invalid", function (event) {
  event.preventDefault();
  if (!event.target.validity.valid) {
    const validationMessage = event.target.validationMessage;
    const toast = document.createElement("div");
    toast.classList.add("custom-validation-message");
    toast.textContent = validationMessage;
    event.target.insertAdjacentElement("afterend", toast);
  }
});

passwordInput.addEventListener("input", function (event) {
  const toast = event.target.nextElementSibling;
  if (toast && toast.classList.contains("custom-validation-message")) {
    toast.remove();
  }
  event.target.setCustomValidity("");
});

confirmPasswordInput.addEventListener("invalid", function (event) {
  event.preventDefault();
  if (!event.target.validity.valid) {
    const validationMessage = event.target.validationMessage;
    const toast = document.createElement("div");
    toast.classList.add("custom-validation-message");
    toast.textContent = validationMessage;
    event.target.insertAdjacentElement("afterend", toast);
  }
});

confirmPasswordInput.addEventListener("input", function (event) {
  const toast = event.target.nextElementSibling;
  if (toast && toast.classList.contains("custom-validation-message")) {
    toast.remove();
  }
  event.target.setCustomValidity("");
});
