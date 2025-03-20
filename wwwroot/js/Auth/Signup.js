import loadCss from "/js/components/reuse_func.js"

function validateNameInput(inputId, errorId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  const nameRegex = /^[A-Za-z]+$/;

  input.addEventListener("input", () => {
    if (!nameRegex.test(input.value) && input.value.length > 0) {
      input.style.borderColor = "red";
      error.textContent = "Only alphabet characters are allowed.";
      error.style.color = "red";
      error.style.display = "block";
    } else {
      input.style.borderColor = "";
      error.textContent = "";
      error.style.display = "none";
    }
  });
}

function formatDateToDDMMYYYY(date) {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function validateDateInput() {
  const dobInput = document.getElementById("datePicker");
  const error = document.getElementById("dobError");
  
  dobInput.addEventListener("change", () => {
    const selectedDate = dobInput.value;
    const today = new Date();
    today.setDate(today.getDate() - 2);

    const formattedToday = formatDateToDDMMYYYY(today);

    if (!dobInput.value) {
      dobInput.style.borderColor = "red";
      error.textContent = "Please enter your date of birth.";
      error.style.color = "red";
      error.style.display = "block";
    } else if (selectedDate >= formattedToday) {
      dobInput.style.borderColor = "red";
      error.textContent = "Date of birth must be at least 2 days before today.";
      error.style.color = "red";
      error.style.display = "block";
    } else {
      dobInput.style.borderColor = "";
      error.textContent = "";
      error.style.display = "none";
    }
  });
}

// Password validation function
function validatePassword() {
  const passwordInput = document.getElementById("password")
  const password = passwordInput.value

  // Get password validation elements
  const strengthContainer = document.querySelector(".pw-strength-container")
  const strengthIndicator = document.querySelector(".pw-strength-indicator")
  const strengthMeter = document.querySelector(".pw-strength-meter")
  const strengthFill = document.querySelector(".pw-strength-meter-fill")
  const passwordRequirements = document.querySelector(".pw-requirements-box")

  if (password.length > 0) {
    // Show validation elements
    passwordRequirements.style.display = "block"
    strengthContainer.style.display = "flex"
    strengthMeter.style.display = "block"

    // Check requirements
    const hasEightChars = password.length >= 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)

    // Update requirement indicators
    updateRequirement("pw-req-length", hasEightChars)
    updateRequirement("pw-req-uppercase", hasUpperCase)
    updateRequirement("pw-req-lowercase", hasLowerCase)
    updateRequirement("pw-req-number", hasNumber)
    updateRequirement("pw-req-special", hasSpecialChar)

    // Calculate strength
    let strength = 0
    if (hasEightChars) strength++
    if (hasUpperCase) strength++
    if (hasLowerCase) strength++
    if (hasNumber) strength++
    if (hasSpecialChar) strength++

    // Update strength indicator
    if (strength <= 2) {
      strengthIndicator.textContent = "Weak"
      strengthIndicator.className = "pw-strength-indicator pw-strength-weak"
      strengthFill.className = "pw-strength-meter-fill pw-strength-weak"
      strengthFill.style.width = "33%"
    } else if (strength <= 4) {
      strengthIndicator.textContent = "Medium"
      strengthIndicator.className = "pw-strength-indicator pw-strength-medium"
      strengthFill.className = "pw-strength-meter-fill pw-strength-medium"
      strengthFill.style.width = "66%"
    } else {
      strengthIndicator.textContent = "Strong"
      strengthIndicator.className = "pw-strength-indicator pw-strength-strong"
      strengthFill.className = "pw-strength-meter-fill pw-strength-strong"
      strengthFill.style.width = "100%"
    }
  } else {
    // Hide validation elements if password is empty
    passwordRequirements.style.display = "none"
    strengthContainer.style.display = "none"
    strengthMeter.style.display = "none"
  }

  // Check if passwords match
  const confirmPasswordInput = document.getElementById("confirm-password")
  const mismatchMessage = document.getElementById("password-mismatch")

  if (confirmPasswordInput && confirmPasswordInput.value) {
    if (passwordInput.value === confirmPasswordInput.value) {
      if (mismatchMessage) {
        mismatchMessage.style.display = "flex"
        mismatchMessage.innerHTML = '<span class="req-icon req-met"></span> Passwords match'
        mismatchMessage.className = "password-match"
      }
    } else {
      if (mismatchMessage) {
        mismatchMessage.style.display = "flex"
        mismatchMessage.innerHTML = '<span class="req-icon req-not-met"></span> Passwords don\'t match'
        mismatchMessage.className = "password-mismatch"
      }
    }
  } else {
    if (mismatchMessage) mismatchMessage.style.display = "none"
  }
}

function updateRequirement(id, isMet) {
  const requirement = document.getElementById(id)
  if (!requirement) return

  // Get the text content
  const textSpan = requirement.querySelector(".req-text")
  const text = textSpan ? textSpan.textContent : requirement.textContent.replace(/[•✓]/g, "").trim()

  // Update the requirement
  if (isMet) {
    requirement.innerHTML = `<span class="req-icon req-met"></span> <span class="req-text">${text}</span>`
    requirement.className = "pw-req-item pw-req-met"
  } else {
    requirement.innerHTML = `<span class="req-icon req-not-met"></span> <span class="req-text">${text}</span>`
    requirement.className = "pw-req-item"
  }
}

async function toggleCustomInput() {
  var selectBox = document.getElementById("genderSelecter")
  var customInput = document.getElementById("customGenderInput")

  if (selectBox.value === "Custom") {
    customInput.style.display = "flex"
    customInput.setAttribute("required", "true")
  } else {
    customInput.style.display = "none"
    customInput.removeAttribute("required")
  }
}

async function togglePassword() {
  const passwordInput = document.getElementById("password")
  const passwordIcon = document.getElementById("password-icon")

  if (passwordInput.type === "password") {
    passwordInput.type = "text"
    passwordIcon.classList.remove("fa-eye-slash")
    passwordIcon.classList.add("fa-eye")
  } else {
    passwordInput.type = "password"
    passwordIcon.classList.remove("fa-eye")
    passwordIcon.classList.add("fa-eye-slash")
  }
}

async function toggleConfirmPassword() {
  const confirmPasswordInput = document.getElementById("confirm-password")
  const confirmPasswordIcon = document.getElementById("confirm-password-icon")

  if (confirmPasswordInput.type === "password") {
    confirmPasswordInput.type = "text"
    confirmPasswordIcon.classList.remove("fa-eye-slash")
    confirmPasswordIcon.classList.add("fa-eye")
  } else {
    confirmPasswordInput.type = "password"
    confirmPasswordIcon.classList.remove("fa-eye")
    confirmPasswordIcon.classList.add("fa-eye-slash")
  }
}

document.getElementById("googleLogin").addEventListener("click", () => {
  window.location.href = "/api/auth/google-login"
})

document.getElementById("togglePassword").addEventListener("click", togglePassword)
document.getElementById("toggleConfirmPassword").addEventListener("click", toggleConfirmPassword)
document.getElementById("genderSelecter").addEventListener("change", toggleCustomInput)

document.getElementById("signupNextButton").addEventListener("click", () => {
  // ตรวจสอบข้อมูลที่กรอกใน signup-first-step
  const firstName = document.getElementById("firstName").value
  const lastName = document.getElementById("lastName").value
  const dob = document.getElementById("datePicker").value
  const gender = document.getElementById("genderSelecter").value

  // ตรวจสอบว่าทุกช่องกรอกข้อมูลใน section แรกครบหรือไม่
  if (firstName && lastName && dob && gender !== "Null") {
    if (gender === "Custom") {
      const customGender = document.getElementById("customGenderInput").value
      if (!customGender) {
        window.showToast("Please enter a custom gender.", "warning")
        return
      }
    }
    const nameRegex = /^[A-Za-z]+$/;
    if (!nameRegex.test(firstName))
      return window.showToast("First name should only contain alphabetic characters.", "warning");
    if (!nameRegex.test(lastName))
      return window.showToast("Last name should only contain alphabetic characters.", "warning");

    if (!dob)
      return window.showToast("Please enter your date of birth.", "warning")
    // Check if date of birth is less than 3 days ago
    const selectedDate = dob;
    const today = new Date();
    today.setDate(today.getDate() - 2);

    const formattedToday = formatDateToDDMMYYYY(today);
    
    if (selectedDate >= formattedToday) {
      return window.showToast("Date of birth must be at least 3 days in the past.", "warning");
    }

    // Hide first step and show last step
    document.querySelector(".signup-first-step").style.display = "none"
    document.querySelector(".signup-last-step").style.display = "block"
  } else {
    window.showToast("Please fill out all the fields in the first section.", "warning")
  }
})

document.getElementById("signupPrevButton").addEventListener("click", () => {
  // ซ่อน signup-last-step และแสดง signup-first-step
  document.querySelector(".signup-last-step").style.display = "none"
  document.querySelector(".signup-first-step").style.display = "block"
})

document.getElementById("signupButton").addEventListener("click", (event) => {
  event.preventDefault() // Prevent form submission

  // Get input values
  const username = document.getElementById("username").value
  const email = document.getElementById("email").value
  const firstName = document.getElementById("firstName").value
  const lastName = document.getElementById("lastName").value
  let dob = document.getElementById("datePicker").value
  const password = document.getElementById("password").value
  const confirmPassword = document.getElementById("confirm-password").value
  const gender =
    document.getElementById("genderSelecter").value === "Custom"
      ? document.getElementById("customGenderInput").value
      : document.getElementById("genderSelecter").value

  // 02-03-2025   dd mm yyyy to 2025-02-12T14:30:00
  dob = dob.split("-").reverse().join("-") + "T00:00:00" // Change date format to yyyy-mm-dd
  // Validate the passwords match
  if (password !== confirmPassword) {
    window.showToast("Passwords do not match!", "warning")
    return
  }

  // Check password requirements
  const hasEightChars = password.length >= 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)

  if (!hasEightChars || !hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
    window.showToast("Password does not meet all requirements", "warning")
    return
  }

  const data = {
    Username: username,
    Email: email,
    FirstName: firstName,
    LastName: lastName,
    DateOfBirth: dob,
    Password: password,
    Sex: gender,
  }

  // Send registration request to the backend
  fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "Registration successful") {
        window.changePage("Registration successful.", "/", "success")
      } else if (data.errors) {
        window.showToast("Registration failed: " + data.errors.join("\n"), "error")
      } else {
        window.showToast("Registration failed: " + data.status, "error")
      }
    })
    .catch((error) => {
      console.error(error)
      window.showToast("Registration failed: " + error.message, "error")
    })
})

document.addEventListener("DOMContentLoaded", () => {
  loadCss("/css/Auth/Signup2.css")
  loadCss("https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css")

  // ใช้ฟังก์ชันตรวจสอบข้อมูล
  validateNameInput("firstName", "firstNameError");
  validateNameInput("lastName", "lastNameError");
  validateDateInput();

  // Use the global flatpickr variable
  if (typeof window.flatpickr !== "undefined") {
    window.flatpickr("#datePicker", {
      dateFormat: "d-m-Y",
      theme: document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light",
    })
  }

  // Add password validation HTML directly to the DOM
  const passwordWrapper = document.querySelector(".signup-password")
  if (passwordWrapper) {
    // Add strength container
    const strengthContainer = document.createElement("div")
    strengthContainer.className = "pw-strength-container"
    strengthContainer.style.display = "none"
    strengthContainer.innerHTML = '<span>Password Strength:</span><span class="pw-strength-indicator"></span>'
    passwordWrapper.appendChild(strengthContainer)

    // Add strength meter
    const strengthMeter = document.createElement("div")
    strengthMeter.className = "pw-strength-meter"
    strengthMeter.style.display = "none"
    strengthMeter.innerHTML = '<div class="pw-strength-meter-fill"></div>'
    passwordWrapper.appendChild(strengthMeter)

    // Add requirements box
    const requirementsBox = document.createElement("div")
    requirementsBox.className = "pw-requirements-box"
    requirementsBox.style.display = "none"
    requirementsBox.innerHTML = `
    <p>Password must contain:</p>
    <ul>
        <li id="pw-req-length" class="pw-req-item"><span class="req-icon req-not-met"></span> <span class="req-text">At least 8 characters</span></li>
        <li id="pw-req-uppercase" class="pw-req-item"><span class="req-icon req-not-met"></span> <span class="req-text">One uppercase letter</span></li>
        <li id="pw-req-lowercase" class="pw-req-item"><span class="req-icon req-not-met"></span> <span class="req-text">One lowercase letter</span></li>
        <li id="pw-req-number" class="pw-req-item"><span class="req-icon req-not-met"></span> <span class="req-text">One number</span></li>
        <li id="pw-req-special" class="pw-req-item"><span class="req-icon req-not-met"></span> <span class="req-text">One special character</span></li>
    </ul>
  `
    passwordWrapper.appendChild(requirementsBox)

    // Add password mismatch message
    const confirmPasswordWrapper = document.querySelector(".signup-confirm-password")
    if (confirmPasswordWrapper) {
      const mismatchMessage = document.createElement("div")
      mismatchMessage.id = "password-mismatch"
      mismatchMessage.style.display = "none"
      mismatchMessage.innerHTML = '<span class="req-icon req-not-met"></span> Passwords don\'t match'
      confirmPasswordWrapper.appendChild(mismatchMessage)
    }

    // Add CSS for password validation
//     const style = document.createElement("style")
//     style.textContent = `
//     /* Password Requirements Box */
//     .pw-requirements-box {
//         background-color: #fff8f8;
//         border: 1px solid #ffcdd2;
//         border-radius: 4px;
//         padding: 10px 15px;
//         margin-top: 8px;
//         margin-bottom: 12px;
//         font-size: 14px;
//     }
    
//     .pw-requirements-box p {
//         margin: 0 0 8px 0;
//         font-weight: 500;
//         color: #e91e63;
//     }
    
//     .pw-requirements-box ul {
//         list-style: none;
//         padding: 0;
//         margin: 0;
//     }
    
//     .pw-req-item {
//         display: flex;
//         align-items: center;
//         margin-bottom: 5px;
//         color: #666;
//         font-size: 14px;
//     }
    
//     .pw-req-item.pw-req-met {
//         color: #e91e63;
//     }
    
//     .req-icon {
//         margin-right: 8px;
//         display: inline-block;
//         width: 16px;
//         height: 16px;
//         position: relative;
//     }
    
//     .req-icon.req-not-met {
//         border-radius: 50%;
//         border: 1.5px solid #999;
//     }
    
//     .req-icon.req-met {
//         background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f472b6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M22 11.08V12a10 10 0 1 1-5.93-9.14'%3E%3C/path%3E%3Cpolyline points='22 4 12 14.01 9 11.01'%3E%3C/polyline%3E%3C/svg%3E");
//         background-size: contain;
//         background-repeat: no-repeat;
//         background-position: center;
//     }
    
//     /* Password Match/Mismatch */
//     #password-mismatch {
//         color: #ff4d4f;
//         font-size: 14px;
//         margin-top: -8px;
//         margin-bottom: 10px;
//         display: flex;
//         align-items: center;
//         gap: 5px;
//     }
    
//     .password-match {
//         color: #e91e63 !important;
//     }
    
//     .password-mismatch {
//         color: #ff4d4f !important;
//     }
    
//     .signup-confirm-password {
//         position: relative;
//     }
// `
//     document.head.appendChild(style)

    // Add event listeners for password validation
    const passwordInput = document.getElementById("password")
    if (passwordInput) {
      passwordInput.addEventListener("input", validatePassword)
    }

    const confirmPasswordInput = document.getElementById("confirm-password")
    if (confirmPasswordInput) {
      confirmPasswordInput.addEventListener("input", validatePassword)
    }
  }
})

