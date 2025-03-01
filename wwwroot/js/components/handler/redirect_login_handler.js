export default class ReDirectLoginHandler {
    constructor() {
        this.div = document.createElement("div");
        this.div.id = "toast";
        this.div.classList.add("toast");
        this.div.textContent = "You need to log in. Redirecting...";
        
        let style = document.createElement("style");
        style.textContent = `
            .toast {
                visibility: hidden;
                min-width: 250px;
                background-color: #ccc;
                color: black;
                text-align: center;
                border-radius: 5px;
                padding: 10px;
                position: fixed;
                top: 80px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 1000;
            }
            .show-toast {
                visibility: visible;
                animation: fadein 0.5s, fadeout 0.5s 2.5s;
            }
            @keyframes fadein {
                from { top: 0; opacity: 0; }
                to { top: 80px; opacity: 1; }
            }
            @keyframes fadeout {
                from { top: 80px; opacity: 1; }
                to { top: 0; opacity: 0; }
            }
        `;

        // this.div = document.createElement("div");
        // this.div.id = "loginBanner"
        // this.div.classList.add("loginBanner");
        // this.div.innerHTML = `
        //     <p>You need to log in before creating a post.</p>
        //     <button id="bannerLoginBtn">Go to Login</button>
        // `

        // let style = document.createElement("style");
        // style.textContent = `
        //     .loginBanner {
        //         display: none;
        //         position: fixed;
        //         top: 10%;
        //         left: 50%;
        //         white-space: none;
        //         min-width: fit-content;
        //         background-color: #ff9800;
        //         color: white;
        //         text-align: center;
        //         padding: 10px;
        //         font-size: 16px;
        //         z-index: 1000;
        //         transform: translate(-50%, -50%);
        //     }
        // `
        document.body.appendChild(style);
        document.body.appendChild(this.div);
    }

    redirect() {
        this.div.classList.add("show-toast");
    
        setTimeout(() => {
            window.location.href = "/login";
        }, 3000);
        // this.div.style.display = "block";

        // document.getElementById("bannerLoginBtn").addEventListener("click", function () {
        //     window.location.href = "/login";
        // });

        return;
    }
}