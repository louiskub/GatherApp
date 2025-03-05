class PopupHistory {
    constructor(header, amount, userList) {
        this.header = header;
        this.amount = amount;
        this.userList = userList;
    }

    render() {
        const container = document.createElement("div");
        container.className = "history-popup-container";

        const closePopupIcon = document.createElement("i");
        closePopupIcon.className = "fas fa-times";
        closePopupIcon.classList.add("close-history-popup-icon");
        closePopupIcon.addEventListener("click", () => {
            container.style.display = "none";
            document.body.classList.remove("no-scroll");
        });
        container.appendChild(closePopupIcon);

        const header = document.createElement("div");
        header.className = "history-popup-header";
        const headerText = document.createElement("h2");
        headerText.textContent = `${this.header}: ${this.amount}`;
        header.appendChild(headerText);
        container.appendChild(header);

        const userListContainer = document.createElement("div");
        userListContainer.className = "history-popup-content";

        this.userList.forEach(user => {
            userListContainer.appendChild(user.render());
        });

        container.appendChild(userListContainer);
        return container;
    }
}

export default PopupHistory;