$(document).ready(function () {
  // get the popup and the OK button
  var popup = $("#popup");
  var okBtn = $(".popup-btn");

  // add click event listener to OK button
  okBtn.click(function () {
    // close the popup
    popup.hide();
    // trigger the route (replace "route-url" with your actual route URL)
    window.location.href = "/settings";
  });
});
