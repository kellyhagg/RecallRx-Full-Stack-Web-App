var input = "";
if (document.querySelector("#password")) {
  input = document.querySelector("#password");
} else if (document.querySelector('input[type="email"]')) {
  input = document.querySelector('input[type="email"]');
} else if (document.querySelector("#name")) {
  input = document.querySelector("#name");
}

input.addEventListener("invalid", function (event) {
  event.preventDefault();
  if (!event.target.validity.valid) {
    const validationMessage = event.target.validationMessage;
    const toast = document.createElement("div");
    toast.classList.add("custom-validation-message");
    toast.textContent = validationMessage;
    event.target.insertAdjacentElement("afterend", toast);
  }
});

input.addEventListener("input", function (event) {
  const toast = event.target.nextElementSibling;
  if (toast && toast.classList.contains("custom-validation-message")) {
    toast.remove();
  }
  event.target.setCustomValidity("");
});
