const Head = document.querySelector("head");
const Body = document.querySelector("body");
const RightNavbar = document.querySelector(".right-navbar");
const Menu = document.querySelector(".menu");

const link = document.createElement("link");
link.rel = "stylesheet";



link.href = "/css/nav/nav_unauth.css";
Head.appendChild(link);
RightNavbar.innerHTML = `
<button class="menu-toggle">
    <i class="fa fa-bars open-icon"></i>
    <i class="fa fa-times close-icon"></i>
</button>`;

Menu.innerHTML = `
<a href="/aboutus">About us<i class="fa fa-fw fa-info"></i></a>
<a href="/login">Login<i class="fa fa-fw fa-user"></i></a>
<a class="active" href="/signup">Sign up<i class="fa fa-user-plus"></i></a>`;

window.userProfile = {role: "visitor" };
window.userProfileLoaded = Promise.resolve(window.userProfile);
