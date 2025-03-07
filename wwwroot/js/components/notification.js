class Notification {
    constructor(type, title, message, time) {
        this.type = type;
        this.title = title;
        this.message = message;
        this.time = time;
    }

    createElement() {
        const notiItem = document.createElement("div");
        notiItem.classList.add("noti-item", this.getCategory());
        notiItem.setAttribute("data-type", this.type);

        const iconDiv = document.createElement("div");
        iconDiv.classList.add("icon");
        const icon = document.createElement("i");
        icon.className = this.getIcon();
        iconDiv.appendChild(icon);

        const contentDiv = document.createElement("div");
        contentDiv.classList.add("noti-content");
        contentDiv.innerHTML = `<div class="noti-title">${this.title}</div>
                                <div class="noti-message">${this.message}</div>`;

        const timeDiv = document.createElement("div");
        timeDiv.classList.add("noti-time");
        const clockIcon = document.createElement("i");
        clockIcon.classList.add("fas", "fa-clock");
        const timeSpan = document.createElement("span");
        timeSpan.textContent = this.time;
        timeDiv.appendChild(clockIcon);
        timeDiv.appendChild(timeSpan);

        notiItem.appendChild(iconDiv);
        notiItem.appendChild(contentDiv);
        notiItem.appendChild(timeDiv);
        
        return notiItem;
    }

    getIcon() {
        const icons = {
            report: "fa-solid fa-triangle-exclamation",
            review: "fa-solid fa-magnifying-glass",
            approved: "fa-solid fa-circle-check",
            rejected: "fa-solid fa-circle-xmark",
            "apply post": "fa-solid fa-envelope",
            update: "fa-solid fa-info-circle",
            comment: "fa-solid fa-comment"
        };
        return icons[this.type] || "fa-solid fa-bell";
    }

    getCategory() {
        return ["report", "review", "update"].includes(this.type) ? "inform-noti" : "post-noti";
    }
}

function renderNotifications(container, notifications) {
    container.innerHTML = "";
    notifications.forEach(noti => {
        const notification = new Notification(noti.type, noti.title, noti.message, noti.time);
        container.appendChild(notification.createElement());
    });
}

export { Notification, renderNotifications };
