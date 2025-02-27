class PopupUserList {
    constructor({ imgUrl, username, buttons }) {
        this.imgUrl = imgUrl;
        this.username = username;
        this.buttons = buttons;
    }

    createButton(text) {
        const button = document.createElement("button");
        button.textContent = text;
        button.className = `popup-${text.toLowerCase()}-btn`;
        return button;
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

        this.buttons.forEach(btnText => {
            buttonGroup.appendChild(this.createButton(btnText));
        });

        container.appendChild(buttonGroup);
        return container;
    }
}

export default PopupUserList;
