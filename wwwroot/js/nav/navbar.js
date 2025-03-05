document.addEventListener("DOMContentLoaded", function () {

    // 📌 Search Toggle
    const searchContainer = document.querySelector(".search-container");
    const searchIcon = document.querySelector(".search-icon");
    searchIcon.addEventListener("click", function () {
        searchContainer.classList.toggle("active");
    });

    // 📌 Theme Toggle (Light/Dark Mode)
    const themeToggle = document.querySelector(".theme-toggle");
    const themeIcon = document.querySelector(".theme-switch");
    const html = document.documentElement;
    const storedTheme = localStorage.getItem("theme") || 
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

    html.setAttribute("data-theme", storedTheme);
    themeToggle.checked = storedTheme === "dark"; // ตั้งค่า checkbox ให้ตรงกับธีม

    themeToggle.addEventListener("change", function () {
        const newTheme = themeToggle.checked ? "dark" : "light";
        html.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
    });

    // Menu Toggle
    const menuToggle = document.querySelector(".menu-toggle");
    const menu = document.querySelector(".menu");
    const openIcon = document.querySelector(".open-icon");
    const closeIcon = document.querySelector(".close-icon");

    menuToggle.addEventListener("click", function (event) {

        event.stopPropagation();
        menu.classList.toggle("active");
        updateIcon();

        // ตรวจสอบว่าหน้าจอมีความกว้างน้อยกว่าค่าที่กำหนด (เช่น 768px)
        if (window.innerWidth < 768) {
            document.documentElement.style.overflow = menu.classList.contains("active") ? "hidden" : "";
            document.dispatchEvent(new CustomEvent("toggleSidebar"));
        } else {
            document.documentElement.style.overflow = "";
        }
    });

    // Close Menu when click outside
    document.addEventListener("click", function (event) {
        if (
            menu.classList.contains("active") &&
            !menu.contains(event.target) &&
            !menuToggle.contains(event.target) &&
            !themeIcon.contains(event.target) // เช็คว่าไม่ใช่ theme toggle
        ) {
            menu.classList.remove("active");
            document.documentElement.style.overflow = ""; 
            updateIcon();
        }
    });
    function updateIcon() {
        if (!openIcon || !closeIcon) return;
        if (menu.classList.contains("active")) {
            openIcon.style.display = "none";
            closeIcon.style.display = "inline";
        } else {
            openIcon.style.display = "inline";
            closeIcon.style.display = "none";
        }
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const sakuraContainer = document.createElement("div");
    sakuraContainer.classList.add("sakura-container");
    document.body.appendChild(sakuraContainer);

    function createSakura() {
        const petal = document.createElement("div");
        petal.classList.add("sakura-petal");

        const size = Math.random() * 15 + 10;
        petal.style.width = `${size}px`;
        petal.style.height = `${size}px`;

        petal.style.left = Math.random() * window.innerWidth + "px";
        petal.style.animationDuration = Math.random() * 5 + 5 + "s"; 
        petal.style.animationDelay = Math.random() * 3 + "s"; 
        petal.style.opacity = Math.random() * 0.5 + 0.5; 

        sakuraContainer.appendChild(petal);

        setTimeout(() => {
            petal.remove();
        }, 10000);
    }

    setInterval(createSakura, 200);
});

