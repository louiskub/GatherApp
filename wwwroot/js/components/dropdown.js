import loadCss from "/js/components/reuse_func.js";
loadCss("/css/components/dropdown.css");

class Dropdown {
    constructor(title, options = [], defaultOption = "") {
        this.title = title;
        this.options = options;
        this.defaultOption = defaultOption;
        this.isDefault = true;
    }

    createOption(text, titleSpan, content, button, upIcon, downIcon) {
        const item = document.createElement("a");
        item.href = "#";
        item.textContent = text;

        item.addEventListener("click", (event) => {
            event.preventDefault();
            titleSpan.textContent = text;

            content.querySelectorAll("a").forEach(a => a.classList.remove("active"));

            // ถ้าเลือก option ที่ไม่ใช่ default ให้ active
            if (text !== this.defaultOption) {
                item.classList.add("active");
            }

            this.isDefault = text === this.defaultOption;
            button.classList.toggle("active", !this.isDefault);
            this.toggleDropdown(content, upIcon, downIcon, false);
        });

        return item;
    }
    

    toggleDropdown(content, upIcon, downIcon, state = null) {
        const isActive = state !== null ? state : !content.classList.contains("active");
        content.classList.toggle("active", isActive);
        upIcon.style.display = isActive ? "inline" : "none";
        downIcon.style.display = isActive ? "none" : "inline";
    }

    render() {
        const container = document.createElement("div");
        container.classList.add("dropdown");

        const button = document.createElement("button");
        button.classList.add("dropdown-btn");

        const titleSpan = document.createElement("span");
        titleSpan.textContent = this.title;

        const downIcon = document.createElement("i");
        downIcon.classList.add("fa", "fa-caret-down");

        const upIcon = document.createElement("i");
        upIcon.classList.add("fa", "fa-caret-up");
        upIcon.style.display = "none";

        button.append(titleSpan, downIcon, upIcon);

        const content = document.createElement("div");
        content.classList.add("dropdown-content");

        content.appendChild(this.createOption(this.defaultOption, titleSpan, content, button, upIcon, downIcon));
        this.options.forEach(option => content.appendChild(this.createOption(option, titleSpan, content, button, upIcon, downIcon)));

        button.addEventListener("click", () => this.toggleDropdown(content, upIcon, downIcon));

        container.append(button, content);
        return container;
    }
}

export default Dropdown;
