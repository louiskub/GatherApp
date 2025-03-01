async function toggleCustomInput() {
    var selectBox = document.getElementById("genderSelecter");
    var customInput = document.getElementById("customGenderInput");
    
    if (selectBox.value === "Custom") {
        customInput.style.display = "flex";
        customInput.setAttribute("required", "true");
    } else {
        customInput.style.display = "none";
        customInput.removeAttribute("required");
    }
}

async function togglePassword() {
    const passwordInput = document.getElementById('password');
    const passwordIcon = document.getElementById('password-icon');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordIcon.classList.remove('fa-eye-slash');
        passwordIcon.classList.add('fa-eye'); 
    } else {
        passwordInput.type = 'password';
        passwordIcon.classList.remove('fa-eye');
        passwordIcon.classList.add('fa-eye-slash'); 
    }
}

async function toggleConfirmPassword() {
    const confirmPasswordInput = document.getElementById('confirm-password');
    const confirmPasswordIcon = document.getElementById('confirm-password-icon');

    if (confirmPasswordInput.type === 'password') {
        confirmPasswordInput.type = 'text';
        confirmPasswordIcon.classList.remove('fa-eye-slash');
        confirmPasswordIcon.classList.add('fa-eye'); 
    } else {
        confirmPasswordInput.type = 'password';
        confirmPasswordIcon.classList.remove('fa-eye');
        confirmPasswordIcon.classList.add('fa-eye-slash'); 
    }
}

document.getElementById('togglePassword').addEventListener('click', togglePassword); 
document.getElementById('toggleConfirmPassword').addEventListener('click', toggleConfirmPassword);
document.getElementById('genderSelecter').addEventListener('change', toggleCustomInput);


document.getElementById('signupNextButton').addEventListener('click', function () {
    // ตรวจสอบข้อมูลที่กรอกใน signup-first-step
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const dob = document.getElementById('datePicker').value;
    const gender = document.getElementById('genderSelecter').value;

    // ตรวจสอบว่าทุกช่องกรอกข้อมูลใน section แรกครบหรือไม่
    if (firstName && lastName && dob && gender !== 'Null') {
        // ซ่อน signup-first-step และแสดง signup-last-step
        document.querySelector('.signup-first-step').style.display = 'none';
        document.querySelector('.signup-last-step').style.display = 'block';
    } else {
        alert('Please fill out all the fields in the first section.'); // แจ้งเตือนให้กรอกข้อมูลให้ครบ
    }
});

document.getElementById('signupPrevButton').addEventListener('click', function () {
    // ซ่อน signup-last-step และแสดง signup-first-step
    document.querySelector('.signup-last-step').style.display = 'none';
    document.querySelector('.signup-first-step').style.display = 'block';
});

document.getElementById("signupButton").addEventListener("click", function (event) {
    event.preventDefault();  // Prevent form submission

    // Get input values
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const dob = document.getElementById("dob").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const gender = document
        .getElementById("genderSelecter")
        .value === "Custom"
        ? document.getElementById("customgenderInput").value
        : document

    // Validate the passwords match
    if (password !== confirmPassword) {
        alert("Passwords do not match!"); // change to display password errors
        return;
    }

    const data = {
        Username: username,
        Email: email,
        FirstName: firstName,
        LastName: lastName,
        DateOfBirth: dob,
        Password: password
    };

    // Send registration request to the backend
    fetch('/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "Registration successful") {
            alert('Registration successful.'); // change to display success message
            window.location.href = '/auth/login';
        } else if (data.errors) {
            alert('Registration failed: ' + data.errors.join('\n')); // change to display all errors
        } else {
            alert('Registration failed: ' + data.status); // change to display all errors
        }
    })
    .catch(error => {
        console.error(error);
        alert('Registration failed: ' + error.message); // change to display all errors
    });
});

document.addEventListener("DOMContentLoaded", function () {
    flatpickr("#datePicker", {
        dateFormat: "d-m-Y",
        theme: document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light"
    });
});