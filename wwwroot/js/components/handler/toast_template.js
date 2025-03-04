export default class ToastTemplate{
    constructor(content, redirectPath = "/login") {
        this.div = document.createElement("div");
        this.div.id = "toast";
        this.div.classList.add("toast");
        this.div.textContent = content;
        this.redirectPath = redirectPath;

        let style = document.createElement("style");
        style.textContent = `
            .toast {
                visibility: hidden;
                min-width: 250px;
                color: black;
                text-align: center;
                border-radius: 5px;
                padding: 10px;
                position: fixed;
                top: 80px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 1000005;
            }

            .color-info {
                background-color: #2196F3;
            }
            .color-success {
                background-color: #4CAF50;
            }
            .color-warning {
                background-color: #FF9800;
            }
            .color-error {
                background-color: #F44336;
            }
            .color-simple{
                background-color: #ccc;
            }

            .show-toast {
                visibility: visible;
                animation: fadein 0.5s, fadeout 0.5s 2.5s;
            }
            .show-temp {
                visibility: visible;
                animation: fadein 0.5s, fadeout 0.5s 1.8s;
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
        document.body.appendChild(style);
        document.body.appendChild(this.div);
    }
    
    changeToast(content, redirectPath = "/login") {
        this.div.textContent = content;
        this.redirectPath = redirectPath;
    }

    redirect(type = "simple") {
        this.div.classList.add(`color-${type}`);
        this.div.classList.add("show-toast");
        setTimeout(() => {
            this.div.classList.remove("show-toast");
            window.location.href = this.redirectPath;
        }, 3000);
        return
    }

    showToast(type = "simple") {
        this.div.classList.add(`color-${type}`);
        this.div.classList.add("show-temp");
        setTimeout(() => {
            this.div.classList.remove("show-temp");
            this.div.classList.remove(`color-${type}`);
        }, 2200);
        return
    }
}
