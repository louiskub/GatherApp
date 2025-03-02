const togglePasswordButton = document.getElementById("togglePassword");
const passwordField = document.getElementById("password");
const icon = document.getElementById("icon");

togglePasswordButton.addEventListener("click", function () {
  // Toggle the type between password and text
  const currentType = passwordField.type;
  passwordField.type = currentType === "password" ? "text" : "password";

  // Change the icon based on visibility
  if (passwordField.type === "password") {
    icon.src = "https://cdn-icons-png.flaticon.com/512/6405/6405909.png"; // Path to the eye icon (show)
  } else {
    icon.src = "https://cdn-icons-png.flaticon.com/512/6803/6803345.png"; // Path to the eye-slash icon (hide)
  }
});
