document.addEventListener("DOMContentLoaded", function () {
    // 📌 Menu Toggle สำหรับมือถือ
    const searchContainer = document.querySelector(".search-container");
    const searchIcon = document.querySelector(".search-icon");

    // Search Bar Toggle
    searchIcon.addEventListener("click", function () {
        searchContainer.classList.toggle("active");
    });

    // 📌 Theme Toggle (Light/Dark Mode)
    const themeToggle = document.querySelector("#theme-toggle");
    const html = document.documentElement;

    // ตรวจสอบธีมที่เคยบันทึก
    const storedTheme = localStorage.getItem("theme") || 
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

    html.setAttribute("data-theme", storedTheme);
    themeToggle.checked = storedTheme === "dark"; // ตั้งค่า checkbox ให้ตรงกับธีม

    // Toggle ธีม
    themeToggle.addEventListener("change", function () {
        const newTheme = themeToggle.checked ? "dark" : "light";
        html.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
    });
});
