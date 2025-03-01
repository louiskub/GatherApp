class PopupUserList {
    constructor(imgUrl, username, textList) {
        this.imgUrl = imgUrl;
        this.username = username;
        this.textList = textList;
    }

    createButtonOrText(text) {
        if (text === "Reviewed" || text === "Reported" || text === "Rejected" || text === "Approved") {
            const span = document.createElement("span");
            span.textContent = text;
            span.className = `popup-status-${text.toLowerCase()}`; 
            return span;
        } else {
            const button = document.createElement("button");
            button.textContent = text;
            button.className = `popup-${text.toLowerCase().replace(" ", "")}-btn`;
            console.log(button.className);
            return button;
        }
    }

    render() {
        const container = document.createElement("div");
        container.className = "popup-user-container";

        const content = document.createElement("div");
        content.className = "popup-user-content";

        const profileImg = document.createElement("img");
        profileImg.className = "popup-user-profile";
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
            buttonGroup.appendChild(this.createButtonOrText(text));
        });

        container.appendChild(buttonGroup);
        return container;
    }
}

export default PopupUserList;