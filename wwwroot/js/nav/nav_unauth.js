document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.querySelector(".menu-toggle");
    const menu = document.querySelector(".menu");
    const openIcon = document.querySelector(".open-icon");
    const closeIcon = document.querySelector(".close-icon");

    menuToggle.addEventListener("click", function () {
        menu.classList.toggle("active");
        
        if (menu.classList.contains("active")) {
            openIcon.style.display = "none";
            closeIcon.style.display = "inline";
        } else {
            openIcon.style.display = "inline";
            closeIcon.style.display = "none";
        }
    });

    // ตรวจสอบให้แน่ใจว่าไอคอนเปิดปิดถูกต้องเมื่อโหลดหน้าเว็บ
    if (menu.classList.contains("active")) {
        openIcon.style.display = "none";
        closeIcon.style.display = "inline";
    } else {
        openIcon.style.display = "inline";
        closeIcon.style.display = "none";
    }

    
    // Function to toggle between Dark and Light Mode
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
        body.classList.add(storedTheme); // Apply the saved theme
    }

    // Toggle theme when the icon is clicked
    themeToggle.addEventListener('click', function () {
        if (body.classList.contains('dark-mode')) {
            body.classList.remove('dark-mode');
            body.classList.add('light-mode');
            localStorage.setItem('theme', 'light-mode'); // Save light mode preference
        } else {
            body.classList.remove('light-mode');
            body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark-mode'); // Save dark mode preference
        }
    });
});
