import UserProfileImage from "./user_profile_image.js";

async function acceptRejectParticipant(postId, username, type, buttonGroup){
    type = type==="Approve" ? "accept" : "reject"
    let response = await fetch(`/api/post/${type}?postId=${postId}&username=${username}`, {
        method: "PATCH",
    });
    if (!response.ok){
        response = await response.text()
        window.showToast(response, "error")
    }
    else if (response.redirected)
        window.changePage("Please Login First", "/login", "warning")
    else {
        response = await response.json()
        type = type==="accept" ? "Approved" : "Rejected"
        buttonGroup.innerHTML = '';
        const newSpan = new PopupUserList().createButtonOrText(type);
        buttonGroup.appendChild(newSpan);

        const updateParticipant = document.querySelector(`#postId${postId} #participant`)
        updateParticipant.textContent = response.curParticipant + "/" + updateParticipant.textContent.split("/")[1]
    }
}

async function reviewParticipant(postId, username, type){

}

async function reportParticipant(postId, username, type){

}

class PopupUserList {
    constructor(imgUrl, username, textList, postId, isOwner) {
        this.imgUrl = imgUrl;
        this.username = username;
        this.textList = textList;
        this.postId = postId
        this.isOwner = isOwner
    }

    createButtonOrText(text, buttonGroup) {
        if (text === "Reviewed" || text === "Reported" || text === "Rejected" || text === "Approved") {
            const span = document.createElement("span");
            if (text === "Approved")
                span.innerHTML = `<i class="fa-solid fa-circle" style="color: #00ff00;"></i>Approved`;
            else if (text === "Rejected")
                span.innerHTML = `<i class="fa-solid fa-circle" style="color: #ff0000;"></i>Rejected`;
            else 
                span.textContent = text;
            span.className = `popup-status-${text.toLowerCase()}`; 
            return span;
        } else {
            const button = document.createElement("button");
            button.textContent = text;
            button.className = `popup-${text.toLowerCase().replace(" ", "")}-btn`;
            if (text == "Approve" || text == "Reject") {
                button.addEventListener("click", async() => acceptRejectParticipant(this.postId, this.username, text, buttonGroup))
            }
            else if (text == "Review") {
                button.addEventListener("click", () => window.location.href = `/review?postId=${this.postId}&username=${this.username}`) // Fixed typo here
            }
            else if (text == "Report") {
                button.addEventListener("click", () => window.location.href = `/report?postId=${this.postId}&username=${this.username}`)
            }
            else if (text == "Attached File") {
                button.addEventListener("click", () => {
                    window.open(`/api/post/getfile?postId=${this.postId}&participantName=${this.username}`,'_blank').focus();
                })
            }
            return button;
        }
    }

    render() {
        const container = document.createElement("div");
        container.className = "popup-user-container";

        const content = document.createElement("div");
        content.className = "popup-user-content";
        
        this.displayUsernane = this.username;
        if (this.isOwner){
            this.displayUsernane += " (Owner)";
        }
        const profileImg = new UserProfileImage(
            this.username, 
            this.imgUrl, 
            "60px", 
            "2px solid var(--text-color", 
            "popup-user-profile"
        ).render();
        profileImg.src = this.imgUrl;
        profileImg.alt = this.displayUsernane;

        const namePara = document.createElement("p");
        namePara.className = "popup-username";
        namePara.textContent = this.displayUsernane;

        content.appendChild(profileImg);
        content.appendChild(namePara);
        container.appendChild(content);

        const buttonGroup = document.createElement("div");
        buttonGroup.className = "popup-button-group";
        this.textList.forEach(text => {
            buttonGroup.appendChild(this.createButtonOrText(text, buttonGroup));
        });

        container.appendChild(buttonGroup); // Fixed typo here
        return container;
    }
}

export default PopupUserList;