import UserProfileImage from "/js/components/user_profile_image.js";

document.addEventListener("DOMContentLoaded", function () {
    profile = document.querySelector(".profile")

    if (profile) {
        const userProfileImage = new UserProfileImage(
            "UsernameKubeieijububu55567890", 
            "https://i.pinimg.com/736x/26/6e/5c/266e5cc575f46b6b309f0e5864707ce1.jpg", 
            "50px"
        )
        console.log("kuy")
    profile.appendChild(userProfileImage.render())
    }
    // const menuToggle = document.querySelector(".menu-toggle");
    // const menu = document.querySelector(".menu");
    // const openIcon = document.querySelector(".open-icon");
    // const closeIcon = document.querySelector(".close-icon");
    // const themeToggle = document.querySelector(".theme-switch");

    // Menu Toggle
    // menuToggle.addEventListener("click", function (event) {
    //     event.stopPropagation(); // ป้องกัน event จากการ propagate ออกไปที่ document
    //     menu.classList.toggle("active");
    //     updateIcon();
    // });

    // // Close Menu when click outside
    // document.addEventListener("click", function (event) {
    //     if (
    //         menu.classList.contains("active") &&
    //         !menu.contains(event.target) &&
    //         !menuToggle.contains(event.target) &&
    //         !themeToggle.contains(event.target) // เช็คว่าไม่ใช่ theme toggle
    //     ) {
    //         menu.classList.remove("active");
    //         updateIcon();
    //     }
    // });
    // function updateIcon() {
    //     if (!openIcon || !closeIcon) return;
    //     if (menu.classList.contains("active")) {
    //         openIcon.style.display = "none";
    //         closeIcon.style.display = "inline";
    //     } else {
    //         openIcon.style.display = "inline";
    //         closeIcon.style.display = "none";
    //     }
    // }

    // Logout button
    const logoutButton = document.querySelector(".log-out");

    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            localStorage.removeItem("authorized");
            window.location.href = "/";
        });
    }
});