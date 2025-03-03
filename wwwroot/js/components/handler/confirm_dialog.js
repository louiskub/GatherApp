export default class ConfirmDialog{
    constructor(heaeder, message, notext, yestext, noCallback, yesCallback) {
        this.div = document.createElement("div");
        this.div.classList.add("confirm-overlay");

        this.confirmBox = document.createElement("div");
        this.confirmBox.classList.add("confirm-box");

        this.confirmHeader = document.createElement("h2");
        this.confirmHeader.id = "confirm-header";
        this.confirmMessage = document.createElement("p");
        this.confirmMessage.id = "confirmMessage";


        this.confirmButtons = document.createElement("div");
        this.confirmButtons.classList.add("confirm-buttons");

        this.confirmNo = document.createElement("button");
        this.confirmNo.classList.add("confirm-btn", "confirm-no");
        this.confirmNo.id = "confirmNo";
        
        this.confirmYes = document.createElement("button");
        this.confirmYes.classList.add("confirm-btn", "confirm-yes");
        this.confirmYes.id = "confirmYes";

        this.confirmButtons.appendChild(confirmNo);
        this.confirmButtons.appendChild(confirmYes);
        
        this.confirmBox.appendChild(confirmHeader);
        this.confirmBox.appendChild(confirmMessage);
        this.confirmBox.appendChild(confirmButtons);

        this.div.appendChild(confirmBox);


        this.confirmYes.addEventListener("click", () => {
            overlay.style.display = "none";
            document.body.style.overflow = "";
        })

        this.confirmNo.addEventListener("click", () => { 
            overlay.style.display = "none";
            document.body.style.overflow = "";
        })

        document.body.appendChild(this.div);
    }
}