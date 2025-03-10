import HistoryActivity from "/js/History/historyContainer.js"
import FilterButton from '/js/components/filter_button.js';
var inComming, pending, completed, fail

async function fetchMyApp(){
    let response = await fetch('/api/user/myapplication')
    if (!response.ok){
        response = await response.text()
        return window.showToast(response, "warning")
    }
    else if (response.redirected)
        return window.changePage("Please Login First", "/login", "warning")
    else {
        response = await response.json()
        inComming = response.inComming
        completed = response.success
        pending = response.pending
        fail = response.fail
    }
    
}


function addContent(appList, appType, appContainer){
    if (appList.length == 0) {
        let div = document.createElement("div")
        div.className = "noContent"
        div.innerHTML = "<h3>No Activity</h3>"
        appContainer.appendChild(div)
    }
    appList.forEach(app => {
        let post = app.post.post
        let activity = app.post.activity
        let actTypes = app.post.actTypes
        const App = new HistoryActivity(post.id, post.curParticipant, post.maxParticipant
            , activity.actDatetime, post.postName, appType, actTypes, post.isOpened, app.isAttached).render()
            appContainer.appendChild(App)
    });
}


async function loadContent(){
    await fetchMyApp()
    const filterMap = {
        all: ["post-history-content.incoming", "post-history-content.pending", "post-history-content.completed", ".post-history-content.fail"],
        incoming: [".post-history-content.incoming"],
        pending: [".post-history-content.pending"],
        completed: [".post-history-content.completed"],
        fail: [".post-history-content.fail"]
    };
    
    addContent(inComming, "accept", document.querySelector(filterMap.incoming[0]))
    addContent(pending, "pending", document.querySelector(filterMap.pending[0]))
    addContent(completed, "finish", document.querySelector(filterMap.completed[0]))
    addContent(fail, "reject", document.querySelector(filterMap.fail[0]))
}


document.addEventListener("DOMContentLoaded", async function () {
    await window.userProfileLoaded
    const historyFilter = document.querySelector(".history-filter");
    const buttonList = ["All", "Incoming", "Pending", "Completed", "Fail"];
    const filterMap = {
        all: ["post-history-content.incoming", "post-history-content.pending", "post-history-content.completed", "post-history-content.fail"],
        incoming: ["post-history-content.incoming"],
        pending: ["post-history-content.pending"],
        completed: ["post-history-content.completed"],
        fail: ["post-history-content.fail"]
    };

    const filterButton = new FilterButton(buttonList, filterMap);
    historyFilter.appendChild(filterButton.render());
    filterButton.filter("all");
    loadContent()
});