import HistoryActivity from "/js/History/historyContainer.js"
import FilterButton from '/js/components/filter_button.js';
var inComming, future, success

function addContent(postList, postType, postContainer){
    if (postList.length == 0) {
        let div = document.createElement("div")
        div.className = "noContent"
        div.innerHTML = "<h3>No Post</h3>"
        postContainer.appendChild(div)
    }
    postList.forEach(post => {
        let activity = post.activity
        let actTypes = post.actTypes
        post = post.post
        const Post = new HistoryActivity(post.id, post.curParticipant, post.maxParticipant
            , activity.actDatetime, post.postName, postType, actTypes, post.isOpened).render()
            postContainer.appendChild(Post)
    });
}


async function fetchMyPost(){
    let response = await fetch('/api/user/myposts')
    const postHistory = document.querySelector(".post-history-content")
    const historyFilter = document.querySelector(".history-filter");
    const postHistoryHeader = document.querySelector(".post-history-header")

    if (!response.ok){
        response = await response.text()
        if (response == "Post not found") {
            historyFilter.style.display = "none"
            postHistory.style.display = "none"
            postHistoryHeader.innerHTML += "<p class='no-post'>You haven't created any post yet.</p>"
        }
        else {
            return window.showToast(response, "warning")
        }
    }
    else if (response.redirected)
        return window.changePage("Please Login First", "/login", "warning")
    else {
        response = await response.json()
        inComming = response.inComming
        future = response.future
        success = response.success
    }
}

async function loadContent(){
    await fetchMyPost()
    const filterMap = {
        all: ["post-history-content.incoming", "post-history-content.future", "post-history-content.success"],
        incoming: [".post-history-content.incoming"],
        future: [".post-history-content.future"],
        completed: [".post-history-content.completed"]
    };
    
    addContent(inComming, "onGoing", document.querySelector(filterMap.incoming[0]))
    addContent(future, "future", document.querySelector(filterMap.future[0]))
    addContent(success, "done", document.querySelector(filterMap.completed[0]))
}

document.addEventListener("DOMContentLoaded", async function () {
    await window.userProfileLoaded
    const historyFilter = document.querySelector(".history-filter");
    const buttonList = ["All", "Incoming", "Future", "Completed"];
    const filterMap = {
        all: ["post-history-content.incoming", "post-history-content.future", "post-history-content.success"],
        incoming: ["post-history-content.incoming"],
        future: ["post-history-content.future"],
        completed: ["post-history-content.completed"]
    };

    const filterButton = new FilterButton(buttonList, filterMap);
    historyFilter.appendChild(filterButton.render());
    filterButton.filter("all");
    loadContent()
});
