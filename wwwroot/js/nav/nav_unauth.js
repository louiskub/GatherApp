document.addEventListener("DOMContentLoaded", function () {
    // 📌 Menu Toggle สำหรับมือถือ
    const menuToggle = document.querySelector(".menu-toggle");
    const menu = document.querySelector(".menu");
    const openIcon = document.querySelector(".open-icon");
    const closeIcon = document.querySelector(".close-icon");


    menuToggle.addEventListener("click", function (event) {
        event.stopPropagation();
        const isActive = menu.classList.toggle("active");
        if (isActive) {
            document.body.style.overflow = "hidden";
        }
        else {
            document.body.style.overflow = "";
        }

        // แสดง/ซ่อนไอคอน
        openIcon.style.display = isActive ? "none" : "inline";
        closeIcon.style.display = isActive ? "inline" : "none";
    });

    // ตั้งค่าไอคอนให้ถูกต้องเมื่อโหลดหน้าเว็บ
    const isMenuActive = menu.classList.contains("active");
    document.body.classList.toggle("no-scroll", isMenuActive);
    openIcon.style.display = isMenuActive ? "none" : "inline";
    closeIcon.style.display = isMenuActive ? "inline" : "none";
});
