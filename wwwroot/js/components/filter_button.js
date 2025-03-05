import loadCss from "/js/components/reuse_func.js";
loadCss("/css/components/filter_button.css");

class FilterButton {
    constructor(buttonList, filterMap) {
        this.buttonList = buttonList.map(button => button.toLowerCase());
        this.filterMap = filterMap;
    }

    filter(targetId) {
        this.buttonList.forEach(buttonId => {
            const buttonElement = document.getElementById(buttonId);
            if (buttonElement) {
                buttonElement.classList.remove("active");
            }
        });
        
        const activeButton = document.getElementById(targetId);
        if (activeButton) {
            activeButton.classList.add("active");
        }
        
        Object.values(this.filterMap).flat().forEach(className => {
            document.querySelectorAll(`.${className}`).forEach(element => {
                element.style.display = "none";
            });
        });
        
        if (targetId === "all") {
            Object.values(this.filterMap).flat().forEach(className => {
                document.querySelectorAll(`.${className}`).forEach(element => {
                    element.style.display = "flex";
                });
            });
        } else {
            this.filterMap[targetId]?.forEach(className => {
                document.querySelectorAll(`.${className}`).forEach(element => {
                    element.style.display = "flex";
                });
            });
        }
    }

    render() {
        const container = document.createElement("div");
        container.classList.add("filter-button-group");
        
        this.buttonList.forEach(buttonId => {
            const buttonElement = document.createElement("button");
            buttonElement.textContent = buttonId.charAt(0).toUpperCase() + buttonId.slice(1);
            buttonElement.id = buttonId;
            buttonElement.classList.add("filter-button");
            if (buttonId === "all") {
                buttonElement.classList.add("active");
            }
            buttonElement.addEventListener("click", () => this.filter(buttonId));
            container.appendChild(buttonElement);
        });

        // setTimeout(() => {
        //     this.filter("all");
        //     Object.values(this.filterMap).flat().forEach(className => {
        //         document.querySelectorAll(`.${className}`).forEach(element => {
        //             element.style.display = "flex";
        //         });
        //     });
        // }, 0);
        
        return container;
    }
}

export default FilterButton;
