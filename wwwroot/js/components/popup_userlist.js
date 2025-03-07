import UserProfileImage from "./user_profile_image.js";

async function acceptRejectParticipant(postId, username, type, buttonGroup){
    type = "accept" ? "accept" : "reject"
    let response = await fetch(`/api/post/${type}?postId=${postId}&username=${username}`, {
        method: "PATCH",
    });
    console.log(response)
    if (!response.ok){
        response = await response.text()
        window.showToast(response, "error")
    }
    else if (response.redirected)
        window.changePage("Please Login First", "/login", "warning")
    else {
        response = await response.json()
        type = "accept" ? "Approved" : "Rejected"
        buttonGroup.innerHTML = '';
        const newSpan = new PopupUserList().createButtonOrText(type);
        buttonGroup.appendChild(newSpan);
    }
}

async function reviewParticipant(postId, username, type){

}

async function reportParticipant(postId, username, type){

}

class PopupUserList {
    constructor(imgUrl, username, textList, postId) {
        this.imgUrl = imgUrl;
        this.username = username;
        this.textList = textList;
        this.postId = postId
    }

    createButtonOrText(text, buttonGroup) {
        if (text === "Reviewed" || text === "Reported" || text === "Rejected" || text === "Approved") {
            const span = document.createElement("span");
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
                button.addEventListener("click", () => window.location.href = `/post/${this.postId}/review`)
            }
            else if (text == "Report") {
                button.addEventListener("click", () => window.location.href = `/post/${this.postId}/report`)
            }
            return button;
        }
    }

    render() {
        const container = document.createElement("div");
        container.className = "popup-user-container";

        const content = document.createElement("div");
        content.className = "popup-user-content";

        const profileImg = new UserProfileImage(
            this.username, 
            this.imgUrl, 
            "60px", 
            "2px solid var(--text-color", 
            "popup-user-profile"
        ).render();
        profileImg.src = this.imgUrl;
        profileImg.alt = this.username;

        const namePara = document.createElement("p");
        namePara.className = "popup-username";
        namePara.textContent = this.username;

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