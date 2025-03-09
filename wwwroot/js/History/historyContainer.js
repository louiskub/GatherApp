import PopupUserList from '/js/components/popup_userlist.js';
import PopupHistory from '/js/components/popup_history.js';

function getButtonsByType(type, hasAttachment, appliedStatus, isReviewed, isReported) {
  let textList = [];
  console.log(`reviewed : ${isReviewed} , reported : ${isReported}`)
  if (type === "reportByOwner") {
      textList.push(isReviewed == 1 ? "Reviewed" : "Review")
      textList.push(isReported == 1 ? "Reported" : "Report")
      console.log(textList)
  }

  if (type === "review"){
      textList = isReviewed === 1 ? ["Reviewed"] : ["Review"];
  }
  if (type === "report"){
      textList = isReported === 1 ? ["Reported"] : ["Report"];
  }
  if (type === "view") {
      if (appliedStatus === null) {
          textList = ["Approve", "Reject"];
          if (hasAttachment)
            textList.unshift("Attached File");
      }
      else {
          textList = appliedStatus === false ? ["Rejected", "Approve"] : ["Approved", "Reject"];
          console.log("adsd",appliedStatus, textList)
          if (hasAttachment)
            textList.splice(1, 0, "Attached File");
        }
      
  }
  return textList || [];
}


// ฟังก์ชันเปิด popup
function openPopup(type, users, postId) {
  const popupContainer = document.querySelector('.popup-container');
  popupContainer.innerHTML = ""; // ล้าง popup ก่อน render ใหม่

  const userList = users.map(userData => {
      const buttons = getButtonsByType(type, userData.isAttached, userData.appliedStatus, userData.isReviewed, userData.isReported);
      return new PopupUserList(userData.profileImg, userData.username, buttons, postId, userData.isOwner);
  });

  const popupHeader = type === "view" ? "Registrants" : "Participants";
  const popup = new PopupHistory(popupHeader, users.length, userList, postId).render();
  popupContainer.appendChild(popup);

  popup.style.display = 'grid';
  document.body.classList.add("no-scroll");
  return popupContainer
}


async function fetchAllRegistrant(postId){
    let response = await fetch(`/api/post/application?postId=${postId}`)
    if (!response.ok){
      response = await response.text()
      window.showToast(response, "error")
    }
    else if (response.redirected)
      window.changePage("Please Login First", "/login", "warning")
    else {
      response = await response.json()
      return response
    }
}
// for report or review
async function fetchAllParticipant(postId) {
  let response = await fetch(`/api/post/participant?postId=${postId}`)
  if (!response.ok){
    response = await response.text()
    window.showToast(response, "error")
  }
  else if (response.redirected)
    window.changePage("Please Login First", "/login", "warning")
  else {
    response = await response.json()
    return response
  }
}

async function viewRegistrantByPostOwner(postId){
  let userList = await fetchAllRegistrant(postId)
  if (userList)
    openPopup("view", userList, postId)
}

async function viewParticipantsByPostOwner(postId){
  let userList = await fetchAllParticipant(postId)
  console.log(userList)
  if (userList)
    openPopup("reportByOwner", userList, postId)
}

async function reportByParticipant(postId){

}

async function reviewByParticipant(postId){
  let userList = await fetchAllParticipant(postId)
  if (userList)
    userList[0].isOwner = true
    openPopup("review", userList, postId)
}


export default class HistoryActivity {
  constructor(
    postId,
    curParticipant,
    maxParticipant,
    date,
    title,
    status,
    tag,
    isOpened,
    isAttached=false
  ) {
    this.postId = postId;
    this.curParticipant = curParticipant;
    this.maxParticipant = maxParticipant;
    this.title = title ?? "Untitled";
    this.status = status ?? "Pending";
    this.tag = tag ?? [];
    this.checked = isOpened;
    this.isAttached = isAttached;

    let formattedDate = new Date(date).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    }).toUpperCase().split(" ")
    formattedDate[2] = formattedDate[2].replace(",", " -")
    formattedDate = formattedDate.join(" ")
    this.date = formattedDate ?? "Unknown Date";

    this.containerStyle = document.createElement("div");
    this.containerStyle.id = "postId"+this.postId;
    this.containerStyle.classList.add("containerStyle");
  }

  createActivityInfo() {
    const activityInfo = document.createElement("div");
    activityInfo.classList.add("contentStyle");

    const activityTitle = document.createElement("h2");
    activityTitle.classList.add("activityTitle");
    let titleA = document.createElement("a");
    titleA.textContent = this.title;
    titleA.href = `/post?postId=${this.postId}`;
    activityTitle.appendChild(titleA);

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
    this.tag.forEach(tag => {
      addTag(tag);
    });

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

    reviewButton.addEventListener("click", () => {
      reviewByParticipant(this.postId)
    })

    reportButton.addEventListener("click", () => {
      window.location.href = `/report?postId=${this.postId}`
    })

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

    statusContainer.innerHTML = `
      <div class="statusContainer">
        <p class="textStyle">Pending</p>
        <div class="buttonContainer"></div>
      </div>`
    if (this.isAttached)
      statusContainer.querySelector(".buttonContainer").innerHTML = `<button class="buttonStyle review">Attached File</button>`

    statusContainer.querySelector(".buttonContainer").innerHTML += `<button class="buttonStyle report">Cancel</button>`
    statusContainer.querySelector(".report").addEventListener("click", async () => {
      let head, cont, noText, yesText;
      let apiPath, successMessage, failMessage, successRedirect;
      head = "Cancel this registration?"
      cont = "Are you sure you want to cancel this registration? This action cannot be undone."
      noText = "Keep it"
      yesText = "Cancel registration"

      apiPath = `api/user/applypost?postid=${this.postId}`
      successMessage = "Post registration canceled successfully"
      failMessage = "Failed to cancel post registration"
      window.confirmAction(head,cont,noText,yesText,
        async () => await fetch(`/api/user/applypost?postid=${this.postId}`, {
            method: 'DELETE'
          }).then(async (response) => {
            if (response.ok) {
              // non auth
              if (response.redirected)
                window.redirectToLogin();
              else
                window.changePage(successMessage, "/history/application", "success");
            }
            // error
            else {
              response = await response.text()
              window.showToast(response, "error");
            }
          }).catch((e) => {throw e})
      )
    })

    if (this.isAttached)
    statusContainer.querySelector(".review").addEventListener("click", () => {
      if(window.userProfile.role != "visitor")
        window.open(`/api/post/getfile?postId=${this.postId}&participantName=${window.userProfile.username}`,'_blank').focus();
    })
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
    switchLabel.textContent = this.checked ? "Open" : "Close";

    const switchBox = document.createElement("label");
    switchBox.classList.add("activitySwitch");
    const switchInput = document.createElement("input");
    switchInput.checked = this.checked;
    switchInput.type = "checkbox";
    switchInput.id = "toggleSwitch";

    const switchSlider = document.createElement("span");
    switchSlider.classList.add("activitySlider");


    switchBox.appendChild(switchInput);
    switchBox.appendChild(switchSlider);
    switchContainer.appendChild(switchLabel);
    switchContainer.appendChild(switchBox);    
    
    switchInput.addEventListener("click", async() => {
      await fetch(`/api/post/toggle?postid=${this.postId}`, {
        method: 'PATCH',
      })
        .then(async (response) => {
            if (response.ok) {
                if (response.redirected) {
                    window.redirectToLogin();
                }
                else {
                    response = await response.json();
                    this.checked = response.isOpened;
                    switchLabel.textContent = this.checked ? "Open" : "Close";
                    switchInput.checked = this.checked;
                }
            } else {
                response = await response.text();
                window.showToast(response, "error");
            }
        })
      .catch((error) => {
          console.log(error)
      })
    }) 
    return switchContainer;
  }

  //   post
  createActivityStatusOnGoing() {
    async function cancelPost(postId){
        let head, cont, noText, yesText;
        let apiPath, successMessage, failMessage, successRedirect;
        head = "Delete this post?"
        cont = "Are you sure you want to delete this post? This action cannot be undone."
        noText = "Keep it"
        yesText = "Delete post"
        apiPath = `/api/post?postid=${postId}`
        successMessage = "Post deleted successfully"
        failMessage = "Failed to delete post"
        successRedirect = "/home"
      window.confirmAction(head,cont,noText,yesText,
        async () => await fetch(apiPath, {
          method: 'DELETE',
          headers: {'Content-Type': 'application/json'}
        })
          .then(response => {
              if (response.ok) {
                  if(response.redirected){
                    window.redirectToLogin();
                  }
                  else {
                    window.changePage(successMessage, "/history/post", "success");
                  }
              } else {
                  window.showToast(failMessage, "error");
              }
          }).catch(() => {
              window.showToast(failMessage, "error");
          }))
    }

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

    // รอแพรมาใส่ event ให้ปุ่ม
    viewButton.addEventListener("click", () => {
      viewRegistrantByPostOwner(this.postId)
    })

    cancelButton.addEventListener("click", () => {
      cancelPost(this.postId)
    });

    return statusContainer;
  }

  //post done
  createActivityStatusDone() {
    const statusContainer = document.createElement("div");
    statusContainer.classList.add("statusContainer");

    const statusName = document.createElement("p");
    statusName.textContent = "Success";
    statusName.classList.add("textStyle");
    
    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("buttonContainer");

    const reviewButton = document.createElement("button");
    reviewButton.classList.add("buttonStyle", "view");
    reviewButton.textContent = "View Participants";

    buttonContainer.appendChild(reviewButton);
    statusContainer.appendChild(statusName);
    statusContainer.appendChild(buttonContainer);

    reviewButton.addEventListener("click",() => {
      viewParticipantsByPostOwner(this.postId)
    })


    return statusContainer;
  }

  initEventBtn(){
    const toggleSwitch = this.containerStyle.querySelector("#toggleSwitch")
    const view = this.containerStyle.querySelector(".view")
    const cancel = this.containerStyle.querySelector(".report")
  }

  render() {
    const innerContainer = document.createElement("div");
    innerContainer.classList.add("innerContainer");

    const indicator = document.createElement("div");

    const activityInfo = this.createActivityInfo();
    innerContainer.appendChild(activityInfo);
    innerContainer.appendChild(this.createTags());

    const displayUsr = activityInfo.querySelector(".displayIcon");
    indicator.classList.add("indicator");

    this.containerStyle.appendChild(indicator);

    switch (this.status) {
      case "onGoing": //post
        innerContainer.appendChild(this.createActivityStatusOnGoing());
        indicator.classList.add("indicator", "onGoing");
        this.containerStyle.appendChild(innerContainer);
        break;
      
      case "future": //post
        innerContainer.appendChild(this.createActivityStatusOnGoing());
        indicator.classList.add("indicator", "future");
        this.containerStyle.appendChild(innerContainer);
        break;

      case "done": //post
        innerContainer.appendChild(this.createActivityStatusDone());
        indicator.classList.add("indicator", "activityDone");
        if (displayUsr.parentNode) {
          activityInfo.removeChild(displayUsr);
        }
        this.containerStyle.appendChild(innerContainer);
        break;

      case "finish": //application
        innerContainer.appendChild(this.createActivityStatusFinished());
        indicator.classList.add("indicator", "finish");
        if (displayUsr && displayUsr.parentNode) {
          displayUsr.parentNode.removeChild(displayUsr);
        }

        this.containerStyle.appendChild(innerContainer);
        break;

      case "accept": //application
        innerContainer.appendChild(this.createActivityStatusAccepted());
        indicator.classList.add("indicator", "accept");
        if (displayUsr.parentNode) {
          activityInfo.removeChild(displayUsr);
        }
        this.containerStyle.appendChild(innerContainer);
        break;

      case "pending": //application
        innerContainer.appendChild(this.createActivityStatusPending());
        indicator.classList.add("indicator", "pending");
        if (displayUsr.parentNode) {
          activityInfo.removeChild(displayUsr);
        }
        this.containerStyle.appendChild(innerContainer);
        break;

      case "reject": //application
        innerContainer.appendChild(this.createActivityStatusRejected());
        indicator.classList.add("indicator", "reject");
        if (displayUsr.parentNode) {
          activityInfo.removeChild(displayUsr);
        }
        this.containerStyle.appendChild(innerContainer);
        break;

      default:
        console.warn("Unknown status:", this.status);
        break;
    }

    return this.containerStyle;
  }
}
