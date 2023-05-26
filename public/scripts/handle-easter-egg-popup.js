$(document).ready(function () {
  // Get the popup and the OK button
  var popup = $("#popup");
  var okBtn = $(".popup-btn");

  // Add click event listener to OK button
  okBtn.click(function () {
    // Close the popup
    popup.hide();
    okBtn.hide();
    window.location.href = "/homepage";
  });
});
