import loadCss from "/js/components/reuse_func.js";
loadCss("/css/components/activity.css");

class Activity {
    constructor(id, activityName, registrants, approved, maxApproved, status, date, time) {
        this.id = id; 
        this.activityName = activityName;
        this.registrants = registrants;
        this.approved = approved;
        this.maxApproved = maxApproved;
        this.status = status;
        this.date = date;
        this.time = time;
    }

    createActivity() {
        let activityHTML = `
        <article class="activity-container ${this.status ? 'complete' : 'incomplete'}" data-id="${this.id}">
            <div class="activity-content-left">
                <div class="activity-header">
                    <a class="activity-title" href="/post">${this.activityName}</a>
                    <div class="activity-status">
                    ${this.status ? `
                        <i class="fas fa-circle" style="font-size: 12px;"></i>
                        <p>Success</p>
                        ` : `
                        <input type="checkbox" class="activity-status-toggle" id="toggle-${this.id}">
                        <label for="toggle-${this.id}" class="activity-status-switch">
                            <span class="activity-status-switch-circle"></span>
                            <span class="activity-status-switch-text"></span>
                        </label>
                    `}
                    </div>
                </div>
                <div class="activity-detail">
                ${!this.status ? `
                    <div class="activity-deadline">
                        <div class="activity-date"><i class="fas fa-calendar-alt"></i> Date: ${this.date}</div>
                        <div class="activity-time"><i class="fas fa-clock"></i> Time: ${this.time}</div>
                    </div>
                ` : ''}
                    <div class="activity-participants">
                        <p class="activity-registrant-user"><i class="fas fa-users"></i> Registrants: ${this.registrants}</p>
                        <p class="activity-approved-user"><i class="fas fa-user"></i> Approved: ${this.approved}/${this.maxApproved}</p>
                    </div>
                </div>
            </div>
            <div class="activity-content-right">
                <div class="activity-button">
                ${this.status ? `
                    <button class="activity-report-button">Report</button>
                    <button class="activity-review-button">Review</button>
                ` : `
                    <button class="activity-view-button"><p id="activity-view-text">View</p></button>
                    <button class="activity-cancel-button">Cancel</button>
                `}
                </div>
            </div>
        </article>
        `;

        return activityHTML;
    }


    render(parentElement) {
        parentElement.innerHTML += this.createActivity();
    }
    
}

export default Activity;


// class Activity {
//     constructor(activityName, registrants, approved, status, date, time) {
//         this.activityName = activityName;
//         this.registrants = registrants;
//         this.approved = approved;
//         this.status = status;
//         this.date = date;
//         this.time = time;
//     }

//     createActivity() {
//         const activityContainer = document.createElement('article');
//         activityContainer.classList.add('activity-container');
//         activityContainer.classList.add(this.status ? 'complete' : 'incomplete');

//         const activityContentLeft = document.createElement('div');
//         activityContentLeft.classList.add('activity-content-left');

//         const activityHeader = document.createElement('div');
//         activityHeader.classList.add('activity-header');

//         const activityTitle = document.createElement('a');
//         activityTitle.classList.add('activity-title');
//         // activityTitle.href = '/post';
//         activityTitle.href = '#';
//         activityTitle.textContent = this.activityName;

//         const activityStatus = document.createElement('div');
//         activityStatus.classList.add('activity-status');

//         if (this.status) {
//             const successIcon = document.createElement('i');
//             successIcon.classList.add('fas', 'fa-circle');
//             successIcon.style.fontSize = '12px';

//             const statusText = document.createElement('p');
//             statusText.textContent = 'Success';

//             activityStatus.appendChild(successIcon);
//             activityStatus.appendChild(statusText);
//         } else {
//             const checkbox = document.createElement('input');
//             checkbox.type = 'checkbox';
//             checkbox.classList.add('activity-status-toggle');
//             checkbox.id = 'activity-status-toggle';

//             const label = document.createElement('label');
//             label.setAttribute('for', 'activity-status-toggle');
//             label.classList.add('activity-status-switch');

//             const circle = document.createElement('span');
//             circle.classList.add('activity-status-switch-circle');

//             const text = document.createElement('span');
//             text.classList.add('activity-status-switch-text');

//             label.appendChild(circle);
//             label.appendChild(text);
//             activityStatus.appendChild(checkbox);
//             activityStatus.appendChild(label);
//         }

//         activityHeader.appendChild(activityTitle);
//         activityHeader.appendChild(activityStatus);

//         const activityDetail = document.createElement('div');
//         activityDetail.classList.add('activity-detail');

//         const registrantText = document.createElement('p');
//         registrantText.classList.add('activity-registrant-text');
//         registrantText.innerHTML = `<i class="fas fa-users"></i> Registrants: ${this.registrants}`;

//         const approvedUser = document.createElement('p');
//         approvedUser.classList.add('activity-approved-user');
//         approvedUser.innerHTML = `<i class="fas fa-user"></i> Approved: ${this.approved}/20`;

//         // Display the date and time only in the Incomplete box
//         if (!this.status) {
//             const activityDeadline = document.createElement('div');
//             activityDeadline.classList.add('activity-deadline');

//             const activityDate = document.createElement('div');
//             activityDate.classList.add('activity-date');
//             activityDate.innerHTML = `<i class="fas fa-calendar-alt"></i> Date: ${this.date}`;

//             const activityTime = document.createElement('div');
//             activityTime.classList.add('activity-time');
//             activityTime.innerHTML = `<i class="fas fa-clock"></i> Time: ${this.time}`;

//             activityDeadline.appendChild(activityDate);
//             activityDeadline.appendChild(activityTime);
//             activityDetail.appendChild(activityDeadline);
//         }

//         activityDetail.appendChild(registrantText);
//         activityDetail.appendChild(approvedUser);

//         activityContentLeft.appendChild(activityHeader);
//         activityContentLeft.appendChild(activityDetail);

//         const activityContentRight = document.createElement('div');
//         activityContentRight.classList.add('activity-content-right');

//         const activityButton = document.createElement('div');
//         activityButton.classList.add('activity-button');

//         if (this.status) {
//             const reportButton = document.createElement('button');
//             reportButton.classList.add('activity-report-button');
//             reportButton.textContent = 'Report';

//             const reviewButton = document.createElement('button');
//             reviewButton.classList.add('activity-review-button');
//             reviewButton.textContent = 'Review';

//             activityButton.appendChild(reportButton);
//             activityButton.appendChild(reviewButton);
//         } else {
//             const viewButton = document.createElement('button');
//             viewButton.classList.add('activity-view-button');
//             viewButton.innerHTML = '<p id="activity-view-text">View</p>';

//             const cancelButton = document.createElement('button');
//             cancelButton.classList.add('activity-cancel-button');
//             cancelButton.textContent = 'Cancel';

//             activityButton.appendChild(viewButton);
//             activityButton.appendChild(cancelButton);
//         }

//         activityContentRight.appendChild(activityButton);
//         activityContainer.appendChild(activityContentLeft);
//         activityContainer.appendChild(activityContentRight);

//         return activityContainer;
//     }

//     render() {
//         // const activityElement = this.createActivity();
//         // parentElement.appendChild(activityElement);
//         return this.createActivity();
//     }
// }
// export default Activity;
