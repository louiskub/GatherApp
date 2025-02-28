class HistoryActivity {
  constructor(date, title, status) {
    this.date = date ?? "Unknown Date";
    this.title = title ?? "Untitled";
    this.status = status ?? "Pending";
  }

  createActivityInfo() {
    const activityInfo = document.createElement("div");
    activityInfo.classList.add("contentStyle");

    const activityTitle = document.createElement("h2");
    activityTitle.textContent = this.title;
    activityTitle.classList.add("activityTitle");

    const displayUsr = document.createElement("div");
    displayUsr.classList.add("displayIcon");

    const usrIcon = document.createElement("svg");
    usrIcon.width = "16";
    usrIcon.xmlns = "http://www.w3.org/2000/svg";
    usrIcon.fill = none;
    usrIcon.viewBox = "0 0 24 24";
    usrIcon.strokeWidth = "2";
    usrIcon.stroke = "currentColor";
    const usrIconPath = document.createElement("path");
    usrIconPath.strokeLinecap = "round";
    usrIconPath.strokeLinejoin = "round";
    usrIconPath.d =
      "M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z";

    const participant = document.createElement("p");
    participant.id = "participant";

    const displayDate = document.createElement("div");
    displayDate.classList.add("displayIcon");

    const dateIcon = document.createElement("svg");
    dateIcon.width = "16";
    dateIcon.xmlns = "http://www.w3.org/2000/svg";
    dateIcon.fill = none;
    dateIcon.viewBox = "0 0 24 24";
    dateIcon.strokeWidth = "2";
    dateIcon.stroke = "currentColor";
    const dateIconPath = document.createElement("path");
    dateIconPath.strokeLinecap = "round";
    dateIconPath.strokeLinejoin = "round";
    dateIconPath.d =
      "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z";

    const activityDate = document.createElement("p");
    activityDate.textContent = this.date;
    activityDate.classList.add("activityDate");

    usrIcon.appendChild(usrIconPath);
    displayUsr.appendChild(usrIcon);
    displayUsr.appendChild(participant);

    dateIcon.appendChild(dateIconPath);
    displayDate.appendChild(dateIcon);
    displayDate.appendChild(activityDate);

    activityInfo.appendChild(activityTitle);
    activityInfo.appendChild(displayUsr);
    activityInfo.appendChild(displayDate);

    return activityInfo;
  }

  //   application finish & post done
  createActivityStatusFinished() {
    const statusContainer = document.createElement("div");
    statusContainer.classList.add("statusContainer");

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("buttonContainer");

    const reviewButton = document.createElement("button");
    reviewButton.classList.add("buttonStyle review");

    const reportButton = document.createElement("button");
    reportButton.classList.add("buttonStyle report");

    buttonContainer.appendChild(reviewButton);
    buttonContainer.appendChild(reportButton);
    statusContainer.appendChild(buttonContainer);

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
    cancelButton.classList.add("buttonStyle report");

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
    cancelButton.classList.add("buttonStyle report");

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
    switchLabel.classList.add("switchText");

    const switchBox = document.createElement("label");
    switchBox.classList.add("switch");
    const switchInput = document.createElement("input");
    switchInput.type("checkbox");

    const switchSlider = document.createElement("span");
    switchSlider.classList.add("slider");

    switchInput.addEventListener("change", function () {
      switchText.textContent = this.checked ? "ON" : "OFF";
    });

    switchContainer.appendChild(switchLabel);
    switchContainer.appendChild(switchBox);
    switchContainer.appendChild(switchInput);
    switchContainer.appendChild(switchSlider);

    return switchContainer;
  }

  //   post
  createActivityStatusOnGoing() {
    const statusContainer = document.createElement("div");
    statusContainer.classList.add("statusContainer");

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("buttonContainer");

    const viewButton = document.createElement("button");
    viewButton.classList.add("buttonStyle view");

    const cancelButton = document.createElement("button");
    cancelButton.classList.add("buttonStyle report");

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
    indicator.classList.add("indicator");

    const containerStyle = document.createElement("div");
    containerStyle.classList.add("containerStyle");

    const activityInfo = this.createActivityInfo();
    innerContainer.appendChild(activityInfo);

    switch (this.status) {
      case "onGoing": //post
        innerContainer.appendChild(this.createActivityStatusOnGoing());
        indicator.classList.add("indicator.onGoing");
        containerStyle.appendChild(indicator);
        containerStyle.appendChild(innerContainer);

      case "done": //post
        innerContainer.appendChild(this.createActivityStatusFinished());
        indicator.classList.add("indicator.done");
        activityInfo.removeChild(displayUsr);
        containerStyle.appendChild(indicator);
        containerStyle.appendChild(innerContainer);

      case "cancel": //post
      //   .removeChild

      case "finish": //application
        innerContainer.appendChild(this.createActivityStatusFinished());
        indicator.classList.add("indicator.finish");
        activityInfo.removeChild(displayUsr);
        containerStyle.appendChild(indicator);
        containerStyle.appendChild(innerContainer);

      case "accept": //application
        innerContainer.appendChild(this.createActivityStatusAccepted());
        indicator.classList.add("indicator.accept");
        activityInfo.removeChild(displayUsr);
        containerStyle.appendChild(indicator);
        containerStyle.appendChild(innerContainer);

      case "pending": //application
        innerContainer.appendChild(this.createActivityStatusPending());
        indicator.classList.add("indicator.pending");
        activityInfo.removeChild(displayUsr);
        containerStyle.appendChild(indicator);
        containerStyle.appendChild(innerContainer);

      case "reject": //application
        innerContainer.appendChild(this.createActivityStatusRejected());
        indicator.classList.add("indicator.reject");
        activityInfo.removeChild(displayUsr);
        containerStyle.appendChild(indicator);
        containerStyle.appendChild(innerContainer);
    }

    return containerStyle;
  }
}

export default HistoryActivity;
