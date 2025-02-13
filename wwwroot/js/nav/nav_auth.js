document.addEventListener("DOMContentLoaded", function () {

    const body = document.body;
    const menuToggle = document.querySelector(".menu-toggle");
    const menu = document.querySelector(".menu");
    const openIcon = document.querySelector(".open-icon");
    const closeIcon = document.querySelector(".close-icon");
    const themeToggle = document.getElementById("theme-toggle");
    const storedTheme = localStorage.getItem("theme");
    const searchContainer = document.querySelector(".search-container");
    const searchBar = document.querySelector(".search-bar");
    const searchIcon = document.querySelector(".search-icon");

    // Menu Toggle
    menuToggle.addEventListener("click", function (event) {
        event.stopPropagation(); // ป้องกัน event จากการ propagate ออกไปที่ document
        menu.classList.toggle("active");
        updateIcon();
    });

    // Close Menu when click outside
    document.addEventListener("click", function (event) {
        if (
            !menu.contains(event.target) &&
            !menuToggle.contains(event.target) &&
            !searchIcon.contains(event.target) && // เช็คว่าไม่ใช่ search icon
            !themeToggle.contains(event.target) // เช็คว่าไม่ใช่ theme toggle
        ) {
            menu.classList.remove("active");
            updateIcon();
        }
    });
    function updateIcon() {
        if (menu.classList.contains("active")) {
            openIcon.style.display = "none";
            closeIcon.style.display = "inline";
        } else {
            openIcon.style.display = "inline";
            closeIcon.style.display = "none";
        }
    }

    // Dark/Light Mode Toggle
    if (storedTheme) body.classList.add(storedTheme);
    themeToggle.addEventListener("click", function () {
        if (body.classList.contains("dark-mode")) {
            body.classList.replace("dark-mode", "light-mode");
            localStorage.setItem("theme", "light-mode");
        } else {
            body.classList.replace("light-mode", "dark-mode");
            localStorage.setItem("theme", "dark-mode");
        }
    });

    // Search Bar Toggle
    searchIcon.addEventListener("click", function () {
        searchBar.classList.toggle("active");
        searchContainer.classList.toggle("active");
    });

});