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
