class HistoryActivity {
  constructor(
    curParticipant,
    maxParticipant,
    date,
    title,
    status,
    tag1,
    tag2,
    tag3
  ) {
    this.curParticipant = curParticipant;
    this.maxParticipant = maxParticipant;
    this.date = date ?? "Unknown Date";
    this.title = title ?? "Untitled";
    this.status = status ?? "Pending";
    this.tag1 = tag1;
    this.tag2 = tag2;
    this.tag3 = tag3;
  }

  createActivityInfo() {
    const activityInfo = document.createElement("div");
    activityInfo.classList.add("contentStyle");

    const activityTitle = document.createElement("h2");
    activityTitle.textContent = this.title;
    activityTitle.classList.add("activityTitle");

    const displayUsr = document.createElement("div");
    displayUsr.classList.add("displayIcon");

    //svg for user
    const usrIcon = document.createElement("img");
    usrIcon.src = "/assets/img/usrIcon.svg";

    const participant = document.createElement("p");
    participant.id = "participant";
    participant.textContent = `${this.curParticipant}/${this.maxParticipant}`;

    const displayDate = document.createElement("div");
    displayDate.classList.add("displayIcon");

    //svg for date
    const dateIcon = document.createElement("img");
    dateIcon.src = "/assets/img/dateIcon.svg";

    const activityDate = document.createElement("p");
    activityDate.textContent = this.date;

    displayUsr.appendChild(usrIcon);
    displayUsr.appendChild(participant);

    displayDate.appendChild(dateIcon);
    displayDate.appendChild(activityDate);

    activityInfo.appendChild(activityTitle);
    activityInfo.appendChild(displayUsr);
    activityInfo.appendChild(displayDate);

    return activityInfo;
  }

  createTags() {
    const tagContainer = document.createElement("div");
    tagContainer.classList.add("activityTagContainer");

    // Helper function to create and append tag if it exists
    const addTag = (tagText) => {
      // create tag if not null
      if (tagText) {
        const tag = document.createElement("div");
        tag.classList.add("activityTag");
        tag.textContent = tagText;
        tagContainer.appendChild(tag);
      }
    };

    addTag(this.tag1);
    addTag(this.tag2);
    addTag(this.tag3);

    return tagContainer;
  }

  //   application finish
  createActivityStatusFinished() {
    const statusContainer = document.createElement("div");
    statusContainer.classList.add("statusContainer");

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("buttonContainer");

    const reviewButton = document.createElement("button");
    reviewButton.classList.add("buttonStyle", "review");
    reviewButton.textContent = "Review";

    const reportButton = document.createElement("button");
    reportButton.classList.add("buttonStyle", "report");
    reportButton.textContent = "Report";

    buttonContainer.appendChild(reviewButton);
    buttonContainer.appendChild(reportButton);
    statusContainer.appendChild(buttonContainer);

    return statusContainer;
  }

  //post done
  createActivityStatusDone() {
    const statusContainer = document.createElement("div");
    statusContainer.classList.add("statusContainer");

    const statusName = document.createElement("p");
    statusName.textContent = "Success";
    statusName.classList.add("textStyle");

    const reportButton = document.createElement("button");
    reportButton.classList.add("buttonStyle", "report");
    reportButton.textContent = "Report";

    statusContainer.appendChild(statusName);
    statusContainer.appendChild(reportButton);

    return statusContainer;
  }

  //   application
  createActivityStatusAccepted() {
    const statusContainer = document.createElement("div");
    statusContainer.classList.add("statusContainer");

    const statusName = document.createElement("p");
    statusName.textContent = "Accepted";
    statusName.classList.add("textStyle");

    const cancelButton = document.createElement("button");
    cancelButton.classList.add("buttonStyle", "report");
    cancelButton.textContent = "Cancel";

    statusContainer.appendChild(statusName);
    statusContainer.appendChild(cancelButton);

    return statusContainer;
  }

  //   application
  createActivityStatusPending() {
    const statusContainer = document.createElement("div");
    statusContainer.classList.add("statusContainer");

    const statusName = document.createElement("p");
    statusName.textContent = "Pending";
    statusName.classList.add("textStyle");

    const cancelButton = document.createElement("button");
    cancelButton.classList.add("buttonStyle", "report");
    cancelButton.textContent = "Cancel";

    statusContainer.appendChild(statusName);
    statusContainer.appendChild(cancelButton);

    return statusContainer;
  }

  //   application
  createActivityStatusRejected() {
    const statusContainer = document.createElement("div");
    statusContainer.classList.add("statusContainer");

    const statusName = document.createElement("p");
    statusName.textContent = "Rejected";
    statusName.classList.add("textStyle");

    statusContainer.appendChild(statusName);

    return statusContainer;
  }

  //   post onGoing
  createStatusSwitch() {
    const switchContainer = document.createElement("div");
    switchContainer.classList.add("switchContainer");

    const switchLabel = document.createElement("p");
    switchLabel.classList.add("switchLabel");
    switchLabel.textContent = "OFF";

    const switchBox = document.createElement("label");
    switchBox.classList.add("activitySwitch");
    const switchInput = document.createElement("input");
    switchInput.type = "checkbox";
    switchInput.id = "toggleSwitch";

    const switchSlider = document.createElement("span");
    switchSlider.classList.add("activitySlider");

    switchInput.addEventListener("change", function () {
      switchLabel.textContent = this.checked ? "ON" : "OFF";
    });

    switchBox.appendChild(switchInput);
    switchBox.appendChild(switchSlider);
    switchContainer.appendChild(switchLabel);
    switchContainer.appendChild(switchBox);

    return switchContainer;
  }

  //   post
  createActivityStatusOnGoing() {
    const statusContainer = document.createElement("div");
    statusContainer.classList.add("statusContainer");

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("buttonContainer");

    const viewButton = document.createElement("button");
    viewButton.classList.add("buttonStyle", "view");
    viewButton.textContent = "View";

    const cancelButton = document.createElement("button");
    cancelButton.classList.add("buttonStyle", "report");
    cancelButton.textContent = "Cancel";

    buttonContainer.appendChild(viewButton);
    buttonContainer.appendChild(cancelButton);
    statusContainer.appendChild(this.createStatusSwitch());
    statusContainer.appendChild(buttonContainer);

    return statusContainer;
  }

  render() {
    const innerContainer = document.createElement("div");
    innerContainer.classList.add("innerContainer");

    const indicator = document.createElement("div");

    const containerStyle = document.createElement("div");
    containerStyle.classList.add("containerStyle");

    const activityInfo = this.createActivityInfo();
    innerContainer.appendChild(activityInfo);
    innerContainer.appendChild(this.createTags());

    const displayUsr = activityInfo.querySelector(".displayIcon");
    indicator.classList.add("indicator");

    containerStyle.appendChild(indicator);

    switch (this.status) {
      case "onGoing": //post
        innerContainer.appendChild(this.createActivityStatusOnGoing());
        indicator.classList.add("indicator", "onGoing");
        containerStyle.appendChild(innerContainer);
        break;

      case "done": //post
        innerContainer.appendChild(this.createActivityStatusDone());
        indicator.classList.add("indicator", "activityDone");
        if (displayUsr.parentNode) {
          activityInfo.removeChild(displayUsr);
        }
        containerStyle.appendChild(innerContainer);
        break;

      case "finish": //application
        innerContainer.appendChild(this.createActivityStatusFinished());
        indicator.classList.add("indicator", "finish");
        if (displayUsr && displayUsr.parentNode) {
          displayUsr.parentNode.removeChild(displayUsr);
        }

        containerStyle.appendChild(innerContainer);
        break;

      case "accept": //application
        innerContainer.appendChild(this.createActivityStatusAccepted());
        indicator.classList.add("indicator", "accept");
        if (displayUsr.parentNode) {
          activityInfo.removeChild(displayUsr);
        }
        containerStyle.appendChild(innerContainer);
        break;

      case "pending": //application
        innerContainer.appendChild(this.createActivityStatusPending());
        indicator.classList.add("indicator", "pending");
        if (displayUsr.parentNode) {
          activityInfo.removeChild(displayUsr);
        }
        containerStyle.appendChild(innerContainer);
        break;

      case "reject": //application
        innerContainer.appendChild(this.createActivityStatusRejected());
        indicator.classList.add("indicator", "reject");
        if (displayUsr.parentNode) {
          activityInfo.removeChild(displayUsr);
        }
        containerStyle.appendChild(innerContainer);
        break;

      default:
        console.warn("Unknown status:", this.status);
        break;
    }

    return containerStyle;
  }
}
