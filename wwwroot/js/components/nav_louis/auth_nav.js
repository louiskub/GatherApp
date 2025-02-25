Head = document.querySelector("head");
Body = document.querySelector("body");
RightNavbar = document.querySelector(".right-navbar");
Menu = document.querySelector(".menu");

const link = document.createElement("link");
link.rel = "stylesheet";

console.log('Authorized');

Head.appendChild(link);

RightNavbar.innerHTML = `                
<button class="noti" href="#" aria-label="Notifications"><i class="fa fa-fw fa-bell"></i></button>
<button class="menu-toggle" aria-label="Open Menu">
    <i class="fa fa-bars open-icon"></i>
    <i class="fa fa-times close-icon"></i>
</button>`;

Menu.innerHTML = `
<div class="profile">
    
</div>

<div class="menu-list">
    <a href="/history/post">Post History<i class="fa fa-history"></i></a>
    <a href="/history/application">Application History<i class="fa fa-file-alt"></i></a>
    <a href="#">Change Password<i class="fa fa-lock"></i></a>
    <a class="log-out" href="#">Logout<i class="fa fa-fw fa-sign-out"></i></a>
</div>`;
{/* <a href="/profile"><img src="https://i.pinimg.com/736x/26/6e/5c/266e5cc575f46b6b309f0e5864707ce1.jpg"></a>
<p>UsernameKubeieijububu55567890</p> */}

const script = document.createElement("script");
link.href = "/css/nav/nav_auth.css";
script.type = "module";
script.src = "/js/nav/nav_auth.js";
Body.appendChild(script);