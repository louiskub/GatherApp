export default class ChangePassword
{
    constructor(){
        this.div = document.createElement('div');
        this.div.classList.add("pwd-change-overlay")
        this.div.id = "passwordChangeOverlay"
        this.div.innerHTML = 
        `
            <div class="pwd-change-popup-wrapper">
                <!-- Icon container moved outside the popup but inside the wrapper -->
                <div class="pwd-change-icon-container">
                    <div class="pwd-change-icon pwd-change-icon-animated">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pwd-change-heart-icon">
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                        </svg>
                    </div>
                </div>
                
                <div class="pwd-change-popup">
                    <div class="pwd-change-header">
                        <h2 class="pwd-change-title">Change Your Password</h2>
                    </div>
                    
                    <!-- Success Message (Hidden by default) -->
                    <div class="pwd-change-success" id="successMessage">
                        <div class="pwd-change-success-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                        </div>
                        <h3 class="pwd-change-success-title">Password Changed Successfully!</h3>
                        <p class="pwd-change-success-text">Your password has been updated securely.</p>
                        <div class="pwd-change-success-progress">
                            <div class="pwd-change-success-progress-bar"></div>
                        </div>
                    </div>
                    
                    <!-- Form -->
                    <form class="pwd-change-form" id="passwordChangeForm">
                    <!-- Error Message (Hidden by default) -->
                    <div class="pwd-change-error" id="errorMessage">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                        <span id="errorText">Error message goes here</span>
                    </div>
                    
                    <!-- Current Password -->
                    <div class="pwd-change-field">
                        <label for="currentPassword" class="pwd-change-label">Current Password</label>
                        <div class="pwd-change-input-wrapper">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pwd-change-input-icon">
                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        <input type="password" id="currentPassword" class="pwd-change-input" placeholder="Enter your current password">
                        <button type="button" class="pwd-change-toggle-btn" data-for="currentPassword">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pwd-change-eye-icon">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pwd-change-eye-off-icon hidden">
                            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                            <line x1="2" x2="22" y1="2" y2="22"></line>
                            </svg>
                        </button>
                        </div>
                    </div>
                    
                    <!-- New Password -->
                    <div class="pwd-change-field">
                        <label for="newPassword" class="pwd-change-label">New Password</label>
                        <div class="pwd-change-input-wrapper">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pwd-change-input-icon">
                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        <input type="password" id="newPassword" class="pwd-change-input" placeholder="Create a new password">
                        <button type="button" class="pwd-change-toggle-btn" data-for="newPassword">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pwd-change-eye-icon">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pwd-change-eye-off-icon hidden">
                            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                            <line x1="2" x2="22" y1="2" y2="22"></line>
                            </svg>
                        </button>
                        </div>
                        
                        <!-- Password Strength Meter -->
                        <div class="pwd-change-strength-meter" id="strengthMeter">
                        <div class="pwd-change-strength-text">
                            <span>Password Strength:</span>
                            <span id="strengthText">Weak</span>
                        </div>
                        <div class="pwd-change-strength-bar">
                            <div class="pwd-change-strength-progress" id="strengthProgress"></div>
                        </div>
                        </div>
                        
                        <!-- Password Requirements -->
                        <div class="pwd-change-requirements">
                        <p class="pwd-change-requirements-title">Password must contain:</p>
                        <ul class="pwd-change-requirements-list">
                            <li class="pwd-change-requirement" id="req-length">
                            <span class="pwd-change-requirement-icon"></span>
                            At least 8 characters
                            </li>
                            <li class="pwd-change-requirement" id="req-uppercase">
                            <span class="pwd-change-requirement-icon"></span>
                            One uppercase letter
                            </li>
                            <li class="pwd-change-requirement" id="req-lowercase">
                            <span class="pwd-change-requirement-icon"></span>
                            One lowercase letter
                            </li>
                            <li class="pwd-change-requirement" id="req-number">
                            <span class="pwd-change-requirement-icon"></span>
                            One number
                            </li>
                            <li class="pwd-change-requirement" id="req-special">
                            <span class="pwd-change-requirement-icon"></span>
                            One special character
                            </li>
                        </ul>
                        </div>
                    </div>
                    
                    <!-- Confirm Password -->
                    <div class="pwd-change-field">
                        <label for="confirmPassword" class="pwd-change-label">Confirm New Password</label>
                        <div class="pwd-change-input-wrapper">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pwd-change-input-icon">
                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        <input type="password" id="confirmPassword" class="pwd-change-input" placeholder="Confirm your new password">
                        <button type="button" class="pwd-change-toggle-btn" data-for="confirmPassword">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pwd-change-eye-icon">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pwd-change-eye-off-icon hidden">
                            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                            <line x1="2" x2="22" y1="2" y2="22"></line>
                            </svg>
                        </button>
                        </div>
                        <div class="pwd-change-match-message" id="matchMessage"></div>
                    </div>
                    
                    <!-- Form Actions -->
                    <div class="pwd-change-actions">
                        <button type="button" class="pwd-change-cancel-btn" id="cancelBtn">Cancel</button>
                        <button type="submit" class="pwd-change-submit-btn" id="submitBtn">
                        <span class="pwd-change-submit-text">Change Password</span>
                        <span class="pwd-change-spinner hidden"></span>
                        </button>
                    </div>
                    </form>
                </div>
            </div>`
    }

    addJs(){
            const triggerBtn = document.querySelector("#change-password-btn")
            const overlay = this.div
            const closeBtn = this.div.querySelector("#cancelBtn")
            const form = this.div.querySelector("#passwordChangeForm")
            const currentPasswordInput = this.div.querySelector("#currentPassword")
            const newPasswordInput = this.div.querySelector("#newPassword")
            const confirmPasswordInput = this.div.querySelector("#confirmPassword")
            const toggleBtns = this.div.querySelectorAll(".pwd-change-toggle-btn")
            const errorMessage = this.div.querySelector("#errorMessage")
            const errorText = this.div.querySelector("#errorText")
            const strengthMeter = this.div.querySelector("#strengthMeter")
            const strengthProgress = this.div.querySelector("#strengthProgress")
            const strengthText = this.div.querySelector("#strengthText")
            const matchMessage = this.div.querySelector("#matchMessage")
            const submitBtn = this.div.querySelector("#submitBtn")
            const spinner = this.div.querySelector(".pwd-change-spinner")
            const submitText = this.div.querySelector(".pwd-change-submit-text")
            const successMessage = this.div.querySelector("#successMessage")
          
            // Password requirement elements
            const reqLength = this.div.querySelector("#req-length")
            const reqUppercase = this.div.querySelector("#req-uppercase")
            const reqLowercase = this.div.querySelector("#req-lowercase")
            const reqNumber = this.div.querySelector("#req-number")
            const reqSpecial = this.div.querySelector("#req-special")
          
            // Open popup
            console.log(
                "trigger", triggerBtn)
            triggerBtn.addEventListener("click", () => {
              overlay.classList.add("active")
              resetForm()
            })
          
            // Close popup
            function closePopup() {
              overlay.classList.remove("active")
            }
          
            closeBtn.addEventListener("click", closePopup)
          
            // Toggle password visibility
            toggleBtns.forEach((btn) => {
              btn.addEventListener("click", function () {
                const inputId = this.getAttribute("data-for")
                const input = this.div.getElementById(inputId)
                const eyeIcon = this.querySelector(".pwd-change-eye-icon")
                const eyeOffIcon = this.querySelector(".pwd-change-eye-off-icon")
          
                if (input.type === "password") {
                  input.type = "text"
                  eyeIcon.classList.add("hidden")
                  eyeOffIcon.classList.remove("hidden")
                } else {
                  input.type = "password"
                  eyeIcon.classList.remove("hidden")
                  eyeOffIcon.classList.add("hidden")
                }
              })
            })
          
            // Password strength and validation
            newPasswordInput.addEventListener("input", function () {
              const password = this.value
          
              // Show strength meter if password is not empty
              if (password) {
                strengthMeter.classList.add("active")
              } else {
                strengthMeter.classList.remove("active")
              }
          
              // Check requirements
              const hasMinLength = password.length >= 8
              const hasUppercase = /[A-Z]/.test(password)
              const hasLowercase = /[a-z]/.test(password)
              const hasNumber = /[0-9]/.test(password)
              const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
          
              // Update requirement indicators
              updateRequirement(reqLength, hasMinLength)
              updateRequirement(reqUppercase, hasUppercase)
              updateRequirement(reqLowercase, hasLowercase)
              updateRequirement(reqNumber, hasNumber)
              updateRequirement(reqSpecial, hasSpecialChar)
          
              // Calculate strength
              let strength = 0
              if (hasMinLength) strength += 20
              if (hasUppercase) strength += 20
              if (hasLowercase) strength += 20
              if (hasNumber) strength += 20
              if (hasSpecialChar) strength += 20
          
              // Update strength meter
              strengthProgress.style.width = strength + "%"
          
              // Remove previous classes
              strengthProgress.classList.remove("weak", "medium", "strong")
              strengthText.classList.remove("weak", "medium", "strong")
          
              // Add appropriate class based on strength
              if (strength < 40) {
                strengthProgress.classList.add("weak")
                strengthText.classList.add("weak")
                strengthText.textContent = "Weak"
              } else if (strength < 80) {
                strengthProgress.classList.add("medium")
                strengthText.classList.add("medium")
                strengthText.textContent = "Medium"
              } else {
                strengthProgress.classList.add("strong")
                strengthText.classList.add("strong")
                strengthText.textContent = "Strong"
              }
          
              // Check if passwords match
              checkPasswordsMatch()
          
              // Update submit button state
              updateSubmitButtonState()
            })
          
            // Check if passwords match
            confirmPasswordInput.addEventListener("input", checkPasswordsMatch)
          
            function checkPasswordsMatch() {
              const newPassword = newPasswordInput.value
              const confirmPassword = confirmPasswordInput.value
          
              if (!confirmPassword) {
                matchMessage.className = "pwd-change-match-message"
                matchMessage.textContent = ""
                confirmPasswordInput.classList.remove("error")
                return
              }
          
              if (newPassword === confirmPassword) {
                matchMessage.className = "pwd-change-match-message valid"
                matchMessage.textContent = "Passwords match"
                confirmPasswordInput.classList.remove("error")
              } else {
                matchMessage.className = "pwd-change-match-message error"
                matchMessage.textContent = "Passwords don't match"
                confirmPasswordInput.classList.add("error")
              }
          
              updateSubmitButtonState()
            }
          
            // Update requirement indicator
            function updateRequirement(element, isValid) {
              if (isValid) {
                element.classList.add("valid")
              } else {
                element.classList.remove("valid")
              }
            }
          
            // Update submit button state
            function updateSubmitButtonState() {
              const password = newPasswordInput.value
              const confirmPassword = confirmPasswordInput.value
          
              const hasMinLength = password.length >= 8
              const hasUppercase = /[A-Z]/.test(password)
              const hasLowercase = /[a-z]/.test(password)
              const hasNumber = /[0-9]/.test(password)
              const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
              const passwordsMatch = password === confirmPassword && password !== ""
          
              const isValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar && passwordsMatch
          
              submitBtn.disabled = !isValid
            }
          
            // Form submission
            form.addEventListener("submit", (e) => {
              e.preventDefault()
          
              // Validate current password
              if (!currentPasswordInput.value) {
                showError("Please enter your current password")
                return
              }
          
              // Start loading state
              submitBtn.disabled = true
              spinner.classList.remove("hidden")
              submitText.textContent = "Saving..."
          
              // Simulate API call
              setTimeout(() => {
                // Hide form and show success message
                form.style.display = "none"
                successMessage.classList.add("active")
          
                // Reset and close after 2 seconds
                setTimeout(() => {
                  closePopup()
                  resetForm()
                  form.style.display = "flex"
                  successMessage.classList.remove("active")
                }, 2000)
              }, 1500)
            })
          
            // Show error message
            function showError(message) {
              errorText.textContent = message
              errorMessage.classList.add("active")
          
              // Hide error after 3 seconds
              setTimeout(() => {
                errorMessage.classList.remove("active")
              }, 3000)
            }
          
            // Reset form
            function resetForm() {
              form.reset()
              errorMessage.classList.remove("active")
              strengthMeter.classList.remove("active")
              matchMessage.className = "pwd-change-match-message"
              matchMessage.textContent = ""
          
              // Reset password toggles
              toggleBtns.forEach((btn) => {
                const eyeIcon = btn.querySelector(".pwd-change-eye-icon")
                const eyeOffIcon = btn.querySelector(".pwd-change-eye-off-icon")
                eyeIcon.classList.remove("hidden")
                eyeOffIcon.classList.add("hidden")
          
                const inputId = btn.getAttribute("data-for")
                const input = this.div.getElementById(inputId)
                input.type = "password"
                input.classList.remove("error")
              })
          
              // Reset requirements
              ;[reqLength, reqUppercase, reqLowercase, reqNumber, reqSpecial].forEach((req) => {
                req.classList.remove("valid")
              })
          
              // Reset submit button
              submitBtn.disabled = true
              spinner.classList.add("hidden")
              submitText.textContent = "Change Password"
            }
    }


    render(){
        const linkChangePassword = document.createElement("link");
        linkChangePassword.rel = "stylesheet";
        linkChangePassword.href = "/css/GOLF/change_password.css";
        document.querySelector("head").appendChild(linkChangePassword);
        this.addJs()
        return this.div
    }
}