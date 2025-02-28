import UserProfileImage from "/js/components/user_profile_image.js";

async function fetchMyProfile() {
    try {
        let response = await fetch("/api/user/myprofile", {
            method: "GET",
            credentials: 'include'
        });
        response = await response.json();
        // console.log("My profile:", response);
        return response;
    } catch (error) {
        console.error("Logout error:", error);
        return error
    }
}

let userProfile = await fetchMyProfile();
let profile = document.querySelector(".profile")

if (profile) {
    const userProfileImage = new UserProfileImage(
        userProfile.username,
        userProfile.profileImg,
        // "https://i.pinimg.com/736x/26/6e/5c/266e5cc575f46b6b309f0e5864707ce1.jpg",
        "60px"
    )
    // console.log("Create Successfully", userProfileImage.render())
    const p = document.createElement("p")
    p.textContent = userProfile.username
    profile.appendChild(userProfileImage.render())
    profile.appendChild(p)
}
// const menuToggle = document.querySelector(".menu-toggle");
// const menu = document.querySelector(".menu");
// const openIcon = document.querySelector(".open-icon");
// const closeIcon = document.querySelector(".close-icon");
// const themeToggle = document.querySelector(".theme-switch");

// // Menu Toggle
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
logoutButton.addEventListener("click", async function () {
    await fetch("/api/auth/logout", {
        method: "POST",
        credentials: 'include'
    });
    window.location.href = "/home";
});