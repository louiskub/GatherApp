import UserProfileImage from "/js/components/user_profile_image.js";
import ToastTemplate from "/js/components/handler/toast_template.js";

function chooseImg(profileImg){
    if (profileImg == "" || profileImg == null) 
        return "https://tr.rbxcdn.com/30DAY-Avatar-310966282D3529E36976BF6B07B1DC90-Png/352/352/Avatar/Png/noFilter"
    else if(profileImg.length < 200) 
        return profileImg
    else 
        return "data:image/jpeg;base64," + profileImg
}

async function logOut(content="Logout successfully") {
    await fetch("/api/auth/logout", {
        method: "POST",
        credentials: 'include'
    });
    window.changeToast(content, "/home")
}

async function fetchMyProfile() {
    try {
        let response = await fetch("/api/user/myprofile", {
            method: "GET",
            credentials: 'include'
        });
        if (response.ok){
            if (response.redirected){
                window.redirectToLogin();
            }
            response = await response.json();
            document.dispatchEvent(new CustomEvent("userProfileLoaded", { detail: response }));
            return response;
        }else {
            logOut("Error: Please login again");
        }
    } catch (error) {
        logOut("Error: Occured");
    }
}

let userProfile = await fetchMyProfile();
let profile = document.querySelector(".profile")

if (profile) {
    document.querySelectorAll(".menu-toggle img").forEach(img => {
        img.src = chooseImg(userProfile.profileImg)
    })
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

    // Logout button
    const logoutButton = document.querySelector(".log-out");
    logoutButton.addEventListener("click", () => {logOut()});
}