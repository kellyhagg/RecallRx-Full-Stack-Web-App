const passwordInput = document.querySelector("#floatingPassword");
const userNameInput = document.querySelector("#floatingInput");

function removeToast(element) {
  const toast = element.nextElementSibling;
  if (toast && toast.classList.contains("custom-validation-message")) {
    toast.remove();
  }
}

passwordInput.addEventListener("invalid", function (event) {
  event.preventDefault();
  removeToast(event.target);
  if (!event.target.validity.valid) {
    const validationMessage = event.target.validationMessage;
    const toast = document.createElement("div");
    toast.classList.add("custom-validation-message");
    toast.textContent = validationMessage;
    event.target.insertAdjacentElement("afterend", toast);
  }
});

passwordInput.addEventListener("input", function (event) {
  removeToast(event.target);
  event.target.setCustomValidity("");
});

userNameInput.addEventListener("invalid", function (event) {
  event.preventDefault();

  removeToast(event.target);
  if (!event.target.validity.valid) {
    const validationMessage = event.target.validationMessage;
    const toast = document.createElement("div");
    toast.classList.add("custom-validation-message");
    toast.textContent = validationMessage;
    event.target.insertAdjacentElement("afterend", toast);
  }
});

userNameInput.addEventListener("input", function (event) {
  removeToast(event.target);
  event.target.setCustomValidity("");
});
