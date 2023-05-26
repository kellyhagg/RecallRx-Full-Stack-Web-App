const emailInput = document.querySelector('input[type="email"]');

emailInput.addEventListener("invalid", function (event) {
  event.preventDefault();
  if (!event.target.validity.valid) {
    const validationMessage = event.target.validationMessage;
    const toast = document.createElement("div");
    toast.classList.add("custom-validation-message");
    if (validationMessage === "Enter an email address") {
      validationMessage = "Please enter a valid email address.";
    }
    toast.textContent = validationMessage;
    event.target.insertAdjacentElement("afterend", toast);
  }
});

emailInput.addEventListener("input", function (event) {
  const toast = event.target.nextElementSibling;
  if (toast && toast.classList.contains("custom-validation-message")) {
    toast.remove();
  }
  event.target.setCustomValidity("");
});
