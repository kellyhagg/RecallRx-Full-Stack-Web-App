// Description: This file contains function that displays and hides 
// successful user details update popup 
// Author: Olga Zimina
// Last modified: 2023-05-26

$(document).ready(function () {
  // Get the popup and the OK button
  var popup = $("#popup");
  var okBtn = $(".popup-btn");

  // Add click event listener to OK button
  okBtn.click(function () {
    // Close the popup
    popup.hide();
    okBtn.hide();
    // Trigger the settings route 
    window.location.href = "/settings";
  });
});
