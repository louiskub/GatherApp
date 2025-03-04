import UserProfileImage from "/js/components/user_profile_image.js";

const Head = document.querySelector("head");
const Body = document.querySelector("body");
const RightNavbar = document.querySelector(".right-navbar");
const Menu = document.querySelector(".menu");

async function setNavbar(){
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/css/nav/nav_auth.css";
    console.log('Authorized');

    Head.appendChild(link);

    RightNavbar.innerHTML = `                
    <button class="noti" href="#" aria-label="Notifications"><i class="fa fa-fw fa-bell"></i></button>
    <button class="menu-toggle" aria-label="Open Menu">
        <img class="fa fa-bars open-icon" src="https://craftycotton.co/wp-content/uploads/2024/09/d987aaeb-e902-495b-805e-91cb90e56215.png"></img>
        <img class="fa fa-times close-icon" src="https://craftycotton.co/wp-content/uploads/2024/09/d987aaeb-e902-495b-805e-91cb90e56215.png"></img>
    </button>`;

    Menu.innerHTML = `
    <div class="profile">
        
    </div>

    <div class="menu-list">
        <a href="/history/likes">Liked Posts<i class="fa fa-heart"></i></a>
        <a href="/history/post">Post History<i class="fa fa-history"></i></a>
        <a href="/history/application">Application History<i class="fa fa-file-alt"></i></a>
        <a href="/user/changepassword">Change Password<i class="fa fa-lock"></i></a>
        <a class="log-out" href="#">Logout<i class="fa fa-fw fa-sign-out"></i></a>
    </div>`;
}

async function getMyProfile() {
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

    window.userProfileLoaded = new Promise(async (resolve) => {
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
                response.role = "user";
                window.userProfile = response;
                document.dispatchEvent(new CustomEvent("userProfileLoaded", { detail: response }));
                resolve()
            }else {
                logOut("Error: Please login again");
            }
        } catch (error) {
            logOut("Error: Occured");
        }
    });
    
    await window.userProfileLoaded;
    let userProfile = window.userProfile;
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
}

async function main() {
    await setNavbar();
    await getMyProfile();
}

main();