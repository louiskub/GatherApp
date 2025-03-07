import UserProfileImage from "/js/components/user_profile_image.js";
import { Notification, renderNotifications } from '/js/components/notification.js';
import ChangePassword from "/js/nav/change_password.js";
import { fetchNotifications } from "/js/notiApi/notiApi.js"; 

const Head = document.querySelector("head");
// const Body = document.querySelector("body");
const RightNavbar = document.querySelector(".right-navbar");
const Menu = document.querySelector(".menu");
const Nav = document.querySelector("nav");

async function setNavbar(){
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/css/nav/nav_auth.css";
    console.log('Authorized');

    Head.appendChild(link);

    RightNavbar.innerHTML = `                
    <button class="noti-toggle" aria-label="Notifications"><i class="fa fa-fw fa-bell"></i></button>
    <button class="menu-toggle" aria-label="Open Menu">
        <img class="open-icon"></img>
        <img class="close-icon"></img>
    </button>`;

    Menu.innerHTML = `
    <div class="profile"></div>

    <div class="menu-list">
        <a href="/history/likes">Liked Posts<i class="fa fa-heart"></i></a>
        <a href="/history/post">Post History<i class="fa fa-history"></i></a>
        <a href="/history/application">Application History<i class="fa fa-file-alt"></i></a>
        <a href="#" id="change-password-btn">Change Password<i class="fa fa-lock"></i></a>
        <a class="log-out" href="#">Logout<i class="fa fa-fw fa-sign-out"></i></a>
    </div>`;

    Nav.innerHTML += `    
    <div class="notification-container" id="notificationContainer">
        <div class="noti-header">
            <span>Notifications</span>
            <span class="badge">0</span>
        </div>
        <div class="filter-container">
            <div class="filter-label">
                <i class="fas fa-filter"></i>
                <span>Filter by type</span>
            </div>
            <div class="filter-notifications">
                <div class="filter-slider" id="filterSlider"></div>
                <button class="filter-all active" data-index="0">All</button>
                <button class="filter-inform-noti" data-index="1">Inform</button>
                <button class="filter-post-noti" data-index="2">Post</button>
            </div>
        </div>
        <div class="noti-list" id="notiList">
            
        </div>
        <div class="empty-state" id="emptyState">
            <i class="fas fa-bell-slash"></i>
            <p>No notifications to display</p>
        </div>
    </div>`;
    new ChangePassword().render();
    
    Menu.querySelector("#change-password-btn").addEventListener("click", {
        
    })
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
    window.userProfile = null;
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
                console.log("✅ userProfile received:", window.userProfile);
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

async function setNotifications() {
    const themeToggle = document.querySelector('.theme-switch');
    const menuToggle = document.querySelector('.menu-toggle');
    const notiToggle = document.querySelector('.noti-toggle');
    const notificationContainer = document.getElementById('notificationContainer');
    const filterButtons = document.querySelectorAll('.filter-notifications button');
    const filterSlider = document.getElementById('filterSlider');
    const emptyState = document.getElementById('emptyState');
    const notiList = document.getElementById('notiList');
    const badge = document.querySelector('.noti-header .badge');

    const notifications = await fetchNotifications();


    renderNotifications(notiList, notifications);

    function updateFilterSlider() {
        const activeButton = document.querySelector('.filter-notifications button.active');
        if (activeButton) {
            filterSlider.style.width = `${activeButton.offsetWidth}px`;
            filterSlider.style.transform = `translateX(${activeButton.offsetLeft}px)`;
        }
    }

    function filterNotifications(filterType) {
        let visibleCount = 0;
        document.querySelectorAll('.noti-item').forEach(item => {
            item.style.display = (filterType === 'all' || item.classList.contains(filterType)) ? 'flex' : 'none';
            visibleCount += item.style.display === 'flex' ? 1 : 0;
        });
        emptyState.style.display = visibleCount === 0 ? 'flex' : 'none';
        badge.textContent = visibleCount;
    }

    notiToggle.addEventListener('click', () => notificationContainer.classList.toggle('show'));
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            updateFilterSlider();
            filterNotifications(button.classList[0].replace('filter-', ''));
        });
    });

    // ปิดการแจ้งเตือนเมื่อคลิกข้างนอก
    document.addEventListener('click', (event) => {
        if (!notificationContainer.contains(event.target) 
            && !notiToggle.contains(event.target)
            && !themeToggle.contains(event.target)
            && !menuToggle.contains(event.target)) {
            notificationContainer.classList.remove('show');
        }
    });

    filterNotifications('all');
    updateFilterSlider();
}

async function main() {
    await setNavbar();
    await getMyProfile();
    await setNotifications();
}

main();