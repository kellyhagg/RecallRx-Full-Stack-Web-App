var input = "";

if (document.querySelector("#password")) {
  input = document.querySelector("#password");
} else if (document.querySelector('input[type="email"]')) {
  input = document.querySelector('input[type="email"]');
} else if (document.querySelector("#name")) {
  input = document.querySelector("#name");
}

function removeToasts() {
  const toast = event.target.nextElementSibling;
  if (toast && toast.classList.contains("custom-validation-message")) {
    toast.remove();
  }
  const errorMessage = document.querySelector(".error-message");
  errorMessage.textContent = "";
}

input.addEventListener("invalid", function (event) {
  event.preventDefault();

  removeToasts();

  if (!event.target.validity.valid) {
    var validationMessage = event.target.validationMessage;
    const toast = document.createElement("div");
    toast.classList.add("custom-validation-message");
    if (validationMessage === "Enter an email address") {
      validationMessage = "Please enter a valid email address.";
    }
    toast.textContent = validationMessage;
    event.target.insertAdjacentElement("afterend", toast);
  }
});

input.addEventListener("input", function (event) {
  removeToasts();
  event.target.setCustomValidity("");
});
