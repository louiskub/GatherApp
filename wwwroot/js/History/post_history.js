import PopupUserList from '/js/components/popup_userlist.js';
import PopupHistory from '/js/components/popup_history.js';
import Activity from '/js/components/activity.js';
import FilterButton from '/js/components/filter_button.js';

// ข้อมูล user ที่จะใช้แสดง popup
const users = [
    {
        imgUrl: "https://preview.redd.it/do-you-guys-think-that-mavuika-is-an-archon-v0-z90atow2ppcd1.jpeg?auto=webp&s=c60295c5e9ab1cdd2001f54a1b87f46c66291559",
        username: "Mavuika Natlan Anchor",
        hasAttachment: true, 
        status: null,
    },
    {
        imgUrl: "https://preview.redd.it/do-you-guys-think-that-mavuika-is-an-archon-v0-z90atow2ppcd1.jpeg?auto=webp&s=c60295c5e9ab1cdd2001f54a1b87f46c66291559",
        username: "Mavuika Natlan Anchor",
        hasAttachment: false, 
        status: 0,
    },
    {
        imgUrl: "https://preview.redd.it/do-you-guys-think-that-mavuika-is-an-archon-v0-z90atow2ppcd1.jpeg?auto=webp&s=c60295c5e9ab1cdd2001f54a1b87f46c66291559",
        username: "Mavuika Natlan Anchor",
        hasAttachment: false,
        status: null,
    },
    {
        imgUrl: "https://preview.redd.it/do-you-guys-think-that-mavuika-is-an-archon-v0-z90atow2ppcd1.jpeg?auto=webp&s=c60295c5e9ab1cdd2001f54a1b87f46c66291559",
        username: "Mavuika Natlan Anchor",
        hasAttachment: true,
        status: 1,
    },
    {
        imgUrl: "https://preview.redd.it/do-you-guys-think-that-mavuika-is-an-archon-v0-z90atow2ppcd1.jpeg?auto=webp&s=c60295c5e9ab1cdd2001f54a1b87f46c66291559",
        username: "Mavuika Natlan Anchor",
        hasAttachment: false,
        status: 0,
    },
    {
        imgUrl: "https://preview.redd.it/do-you-guys-think-that-mavuika-is-an-archon-v0-z90atow2ppcd1.jpeg?auto=webp&s=c60295c5e9ab1cdd2001f54a1b87f46c66291559",
        username: "Mavuika Natlan Anchor",
        hasAttachment: true, 
        status: 1,
    },
    {
        imgUrl: "https://preview.redd.it/do-you-guys-think-that-mavuika-is-an-archon-v0-z90atow2ppcd1.jpeg?auto=webp&s=c60295c5e9ab1cdd2001f54a1b87f46c66291559",
        username: "Mavuika Natlan Anchor",
        hasAttachment: false, 
        status: 0,
    },
];

// Usage example
const postHistoryIncomingContent = document.querySelector('.post-history-content.incoming'); 
const postHistoryFutureContent = document.querySelector('.post-history-content.future');
const postHistoryCompletedContent = document.querySelector('.post-history-content.completed');

const activity1 = new Activity('act1', 'ActivityName1ehrodijcwedgvsuxjdhswuigedbpnoilckje', 57, 15, 20, false, '2021-08-31', '9:30 PM');
const activity2 = new Activity('act2', 'ActivityName1jebnfdoiekmdoikfncked', 57, 15, 20, true, '', '');
const activity3 = new Activity('act3', 'ActivityName1jebnfdoiekmdoikfncked', 57, 15, 20, true, '', ''); 
const activity4 = new Activity('act4', 'ActivityName1jebnfdoiekmdoikfncked', 57, 15, 20, true, '', '');
const activity5 = new Activity('act5', 'ActivityName1jebnfdoiekmdoikfncked', 57, 15, 20, false, '2021-08-31', '10:30 PM');
const activity6 = new Activity('act6', 'ActivityName1jebnfdoiekmdoikfncked', 57, 15, 20, false, '2021-08-31', '10:30 PM');
const activity7 = new Activity('act7', 'ActivityName1jebnfdoiekmdoikfncked', 57, 15, 20, false, '2021-10-21', '11:00 AM');
const activity8 = new Activity('act8', 'ActivityName1jebnfdoiekmdoikfncked', 57, 15, 20, false, '2021-10-21', '11:00 AM');

activity1.render(postHistoryIncomingContent);
activity2.render(postHistoryCompletedContent);
activity3.render(postHistoryCompletedContent);
activity4.render(postHistoryCompletedContent);
activity5.render(postHistoryIncomingContent);
activity6.render(postHistoryIncomingContent);
activity7.render(postHistoryFutureContent);
activity8.render(postHistoryFutureContent);

// ฟังก์ชันเปิด popup
function openPopup(type) {
    const popupContainer = document.querySelector('.popup-container');
    popupContainer.innerHTML = ""; // ล้าง popup ก่อน render ใหม่

    const userList = users.map(userData => {
        const buttons = getButtonsByType(type, userData.hasAttachment, userData.status);
        return new PopupUserList(userData.imgUrl, userData.username, buttons);
    });

    const popupHeader = type === "view" ? "Registrants" : "Participants";
    const popup = new PopupHistory(popupHeader, users.length, userList).render();
    popupContainer.appendChild(popup);

    popup.style.display = 'grid';
    document.body.classList.add("no-scroll");
}

// ฟังก์ชันคืนค่าปุ่มตาม type
function getButtonsByType(type, hasAttachment, status) {
    let textList = [];

    if (type === "review") {
        textList = status === 1 ? ["Reviewed"] : ["Review"];
    }
    if (type === "report") {
        textList = status === 1 ? ["Reported"] : ["Report"];
    }
    if (type === "view") {
        if (status === null) {
            textList = hasAttachment ? ["Attached File", "Approve", "Reject"] : ["Approve", "Reject"];
        }
        else {
            textList = status === 0 ? ["Rejected"] : ["Approved"];
        }
    }
    return textList || [];
}

// Event Listeners
document.querySelector('.activity-review-button').addEventListener('click', () => openPopup("review"));
document.querySelector('.activity-report-button').addEventListener('click', () => openPopup("report"));
document.querySelector('.activity-view-button').addEventListener('click', () => openPopup("view"));

document.addEventListener("DOMContentLoaded", function () {
    // const toggle = document.getElementById("activity-status-toggle");
    // const switchText = document.querySelector(".activity-status-switch-text");
    const historyFilter = document.querySelector(".history-filter");
    const buttonList = ["All", "Incoming", "Future", "Completed", "Incompleted"];
    const filterMap = {
        all: ["post-history-content.incoming", "post-history-content.future", "post-history-content.success"],
        incoming: ["post-history-content.incoming"],
        future: ["post-history-content.future"],
        completed: ["post-history-content.completed"],
        incompleted: ["post-history-content.incoming", "post-history-content.future"],
    };

    const filterButton = new FilterButton(buttonList, filterMap);
    historyFilter.appendChild(filterButton.render());
    filterButton.filter("all");

    // function updateToggleState() {
    //     switchText.textContent = toggle.checked ? "Open" : "Closed";
    // }

    // toggle.addEventListener("change", updateToggleState);
    // updateToggleState();
});
